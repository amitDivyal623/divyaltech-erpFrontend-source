import { Injectable } from '@angular/core';
import * as Crypto from 'crypto-js';
import { environment } from 'src/environments/environment';

@Injectable({providedIn: 'root'})

export class SecurityService {

    // Legacy v1 — unchanged from before, kept so v1 traffic still works.
    private legacyKey = Crypto.enc.Base64.parse("ZGl2eWFsdGVjaG5vbG9neQ==");
    private legacyIv = Crypto.enc.Base64.parse("EBESExQVFhcYGRobHB0eHw==");

    // v2 — authenticated envelope. Same key-derivation formula as CryptoBox.cfc.
    private readonly VERSION_V2 = 2;
    private readonly IV_BYTES = 16;
    private readonly TAG_BYTES = 32;
    private encKey = Crypto.SHA256(environment.apiCryptoSecret + "|enc|v2");
    private macKey = Crypto.SHA256(environment.apiCryptoSecret + "|mac|v2");

    constructor() { }

    encrypt(data: any) {
        let json: string;
        if (data instanceof FormData) {
            const object: any = {};
            data.forEach((value, key) => object[key] = value);
            json = JSON.stringify(object);
        } else {
            json = JSON.stringify(data);
        }

        if (environment.apiCryptoVersion === this.VERSION_V2) {
            return this.encryptV2(json);
        }
        return Crypto.AES.encrypt(json, this.legacyKey, { iv: this.legacyIv }).toString();
    }

    decrypt(data: any) {
        const raw = Crypto.enc.Base64.parse(data);
        if (this.isV2Envelope(raw)) {
            return JSON.parse(this.decryptV2(raw));
        }
        const decipherText = Crypto.AES.decrypt(data, this.legacyKey, { iv: this.legacyIv });
        return JSON.parse(decipherText.toString(Crypto.enc.Utf8));
    }

    // --- v2 internals below. Same envelope layout as CryptoBox.cfc:
    // [1-byte version][16-byte IV][ciphertext][32-byte HMAC-SHA256 tag]

    private isV2Envelope(raw: any): boolean {
        const total = raw.sigBytes;
        const minLength = 1 + this.IV_BYTES + 16 + this.TAG_BYTES;
        if (total < minLength || (total % 16) !== 1) {
            return false;
        }
        const firstByte = (raw.words[0] >>> 24) & 0xff;
        return firstByte === this.VERSION_V2;
    }

    private encryptV2(plaintext: string): string {
        const iv = Crypto.lib.WordArray.random(this.IV_BYTES);
        const cipherParams = Crypto.AES.encrypt(plaintext, this.encKey, { iv });
        const cipherBytes = this.wordArrayToBytes(cipherParams.ciphertext);

        const bodyBytes = [this.VERSION_V2].concat(this.wordArrayToBytes(iv)).concat(cipherBytes);
        const bodyWordArray = this.bytesToWordArray(bodyBytes);

        const tagBytes = this.wordArrayToBytes(Crypto.HmacSHA256(bodyWordArray, this.macKey));
        return this.bytesToWordArray(bodyBytes.concat(tagBytes)).toString(Crypto.enc.Base64);
    }

    private decryptV2(raw: any): string {
        const allBytes = this.wordArrayToBytes(raw);
        const bodyBytes = allBytes.slice(0, allBytes.length - this.TAG_BYTES);
        const tagBytes = allBytes.slice(allBytes.length - this.TAG_BYTES);

        const bodyWordArray = this.bytesToWordArray(bodyBytes);
        const expectedTag = this.wordArrayToBytes(Crypto.HmacSHA256(bodyWordArray, this.macKey));
        const tagOk = expectedTag.length === tagBytes.length &&
            expectedTag.every((b, i) => b === tagBytes[i]);

        if (!tagOk) {
            throw new Error('CryptoBox: message authentication failed.');
        }

        const ivBytes = bodyBytes.slice(1, 1 + this.IV_BYTES);
        const cipherBytes = bodyBytes.slice(1 + this.IV_BYTES);
        const ivWordArray = this.bytesToWordArray(ivBytes);
        const cipherWordArray = this.bytesToWordArray(cipherBytes);
        const cipherParams = Crypto.lib.CipherParams.create({ ciphertext: cipherWordArray });

        return Crypto.AES.decrypt(cipherParams, this.encKey, { iv: ivWordArray }).toString(Crypto.enc.Utf8);
    }

    private wordArrayToBytes(wordArray: any): number[] {
        const bytes: number[] = [];
        for (let i = 0; i < wordArray.sigBytes; i++) {
            bytes.push((wordArray.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff);
        }
        return bytes;
    }

    private bytesToWordArray(bytes: number[]): any {
        const words: number[] = [];
        for (let i = 0; i < bytes.length; i++) {
            words[i >>> 2] = (words[i >>> 2] || 0) | (bytes[i] << (24 - (i % 4) * 8));
        }
        return Crypto.lib.WordArray.create(words, bytes.length);
    }

}
