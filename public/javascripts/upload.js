var validExts = new Array(".xlsx", ".xls");

$('.upload-btn').on('click', function () {
  $('#upload-input').click();
  $('.progress-bar').text('0%');
  $('.progress-bar').width('0%');
});

/*
  Hide the error and success div
*/
$('#notification-container-success').hide();
$('#notification-container-error').hide();

/*
   file extention validation
   @params sender - files array coming from user upload
   description - this function validate the file name against an array of file extention allowed.
   output- boolean value (true , false)
 */
function checkFileExtension(sender) {
  var fileExt = sender[0].name;
  fileExt = fileExt.substring(fileExt.lastIndexOf('.'));
  if (validExts.indexOf(fileExt) < 0) {
    return false;
  }
  else return true;
}

/*Hide the progress*/
function progressWidthZero() {
  setTimeout(function(){
    $('.progress-bar').width('0%');
    location.reload();
  },3000);
}

/* Upload change event captured and file will posted to server */
$('#upload-input').on('change', function () {
  var files = $(this).get(0).files;

  /* Check for valid file extension uploaded */
  if (!checkFileExtension(files)) {
    var errorMsg = "Invalid file selected, valid files are of " + validExts.toString() + " types.";
    $('#notification-container-error').html(errorMsg).show().delay(3000).fadeOut(2000);
    return;
  }


  if (files.length > 0) {
    // create a FormData object which will be sent as the data payload in the
    // AJAX request
    var formData = new FormData();

    // loop through all the selected files and add them to the formData object
    for (var i = 0; i < files.length; i++) {
      var file = files[i];

      // add the files to formData object for the data payload
      formData.append('uploads', file);
    }

    /*
      Posting the file to server
    */
    $.ajax({
      url: '/upload',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function (data) {
        $('#notification-container-success').html(data.message).show();
        //progressWidthZero();
      },
      error: function(err) {
        $('#notification-container-error').html(err.responseJSON.message).show();
        $('.progress-bar').html('file error');
        $('.progress-bar').css("background-color", "#ec3a37");  
        //progressWidthZero();
      },
      xhr: function () {
        // create an XMLHttpRequest
        var xhr = new XMLHttpRequest();

        // listen to the 'progress' event
        xhr.upload.addEventListener('progress', function (evt) {

          if (evt.lengthComputable) {
            // calculate the percentage of upload completed
            var percentComplete = evt.loaded / evt.total;
            percentComplete = parseInt(percentComplete * 100);

            // update the Bootstrap progress bar with the new percentage
            $('.progress-bar').text(percentComplete + '%');
            $('.progress-bar').width(percentComplete + '%');

            // once the upload reaches 100%, set the progress bar text to done
            if (percentComplete === 100) {
              $('.progress-bar').html('file uploaded');
            }
          }
        }, false);

        return xhr;
      }
    });
  }
});
