// client-side js
// run by the browser each time your view template is loaded

// by default, you've got jQuery,
// add other scripts at the bottom of index.html

$(function() {
//   console.log('hello world :o');
  
//   $.get('/dreams', function(dreams) {
//     dreams.forEach(function(dream) {
//       $('<li></li>').text(dream).appendTo('ul#dreams');
//     });
//   });

//   $('form').submit(function(event) {
//     event.preventDefault();
//     var dream = $('input').val();
//     $.post('/dreams?' + $.param({dream: dream}), function() {
//       $('<li></li>').text(dream).appendTo('ul#dreams');
//       $('input').val('');
//       $('input').focus();
//     });
//   });
  
//     $('.btn-edit-country').click(function(event) {
//       console.log($('.btn-edit-country').val);
      
//     });
  
  $('table .btn-edit-country').click(function() {
    var tr = $(this).closest('tr'); // get current row
    var code = tr.children('td:eq(1)').text(); //get the text from second col of current row
    
    console.log(code); 
    
    $.post('/country/edit/', { code: code });
    
  });


});
