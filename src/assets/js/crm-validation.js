(function ($) {
    $(document).ready(function() {
        jQuery.validator.setDefaults({
            errorElement: 'span',
            errorLabelContainer: '.error',
            highlight: function(element) {
                $(element).parent().not(".radio-select").addClass("error");
                // If element is a radio select option
                if ($(element).parent().is(".radio-select")) {
                    $(element).parent().addClass("error-radio");
                    // Also add class to every radio of the same attribute name
                    var attribute_name = $(element).attr("name");
                    $('input[type="radio"][name="' + attribute_name + '"]').parent().addClass("error-radio");
                }
            },
            unhighlight: function(element) {
                $(element).parent().removeClass("error");
                $(element).parent().find('span.error').remove();
                // If element is a radio select option
                if ($(element).parent().is(".radio-select")) {
                    $(element).parent().removeClass("error-radio");
                    // Also add class to every radio of the same attribute name
                    var attribute_name = $(element).attr("name");
                    $('input[type="radio"][name="' + attribute_name + '"]').parent().removeClass("error-radio");
                }
            },
            success: function(label) {
                label.closest('form').not(".radio-select").addClass("valid");
                label.closest('form').find(".alert").remove();
            }
        });
        // start login page
        // login form
        $("#login").validate({
            rules: {
                'username': {
                    required: true,
                    minlength: 6,
                    maxlength: 15
                },
                'password': {
                    required: true
                }/*,
                'forgot_email': {
                    required: true
                }*/
            }
        });
        // end login page
        // start company page
        // add form
        $("#add_company").validate({
            rules: {
                'company_name': {
                    required: true,
                    minlength: 5,
                    maxlength: 150
                },
                'ref_number': {
                    required: true
                },
                'email_id': {
                    required: true,
                    email: true,
                    minlength: 5,
                    maxlength: 100
                },
            }/*,
            messages: {
                'company_name': {
                    required: "Company name can not be left blank",
                    minlength: "Accept minimum 5 letter",
                    maxlength: "Accept maximum 150 letter"
                },
                'ref_number': {
                    required: "Comapny refrence number must be needed"
                },
                'email_id': {
                    required: "Email field required",
                },
            }*/
        });
        // edit form
        $("#edit_company").validate({
            rules: {
                'e_company_name': {
                    required: true,
                    minlength: 5,
                    maxlength: 150
                },
                'e_ref_number': {
                    required: true
                },
                'e_email_id': {
                    required: true,
                    email: true,
                    minlength: 5,
                    maxlength: 100
                }
            }/*,
            messages: {
                'e_company_name': {
                    required: "Company name can not be left blank",
                    minlength: "Accept minimum 5 letter",
                    maxlength: "Accept maximum 150 letter"
                },
                'e_ref_number': {
                    required: "Comapny refrence number must be needed"
                },
                'e_email_id': {
                    required: "Email field required",
                }
            }*/
        });
        // end company page
    });
})(jQuery)
