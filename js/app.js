//设置菜单
var gui = require('nw.gui');
var menubar = new gui.Menu({ type: 'menubar' });
var sub_file = new gui.Menu();

var new_host_item = new gui.MenuItem({
  label: '新建',
  click: function() {

  }
});

var export_item = new gui.MenuItem({
  label: '导出',
  click: function() {

  }
});

var import_item = new gui.MenuItem({
  label: '导入',
  click: function() {

  }
});

var exit_item = new gui.MenuItem({
  label: '退出',
  click: function() {
    gui.App.quit();
  }
});

sub_file.append(import_item);
sub_file.append(new_host_item);
sub_file.append(export_item);
sub_file.append(exit_item);

menubar.append(new gui.MenuItem({ label: '文件', submenu: sub_file }));

var sub_help = new gui.Menu();
var about_item = new gui.MenuItem({
  label: '关于',
  click: function() {

  }
});

sub_help.append(about_item);
menubar.append(new gui.MenuItem({ label: '帮助', submenu: sub_help }));
var win = gui.Window.get();

win.menu = menubar;

$('#public-host').click(function() {
  if ($('.active-li')) {
    $('.active-li').removeClass('active-li');
  }
  $(this).addClass('active-li');
  var result = '';
  var fs = require('fs');

  function readLines(input) {
    var remaining = '',
      flag = false;
    input.on('data', function(data) {
      remaining += data;
      flag = true;
      var index = remaining.indexOf('\n');
      while (index > -1) {
        var line = remaining.substring(0, index);
        remaining = remaining.substring(index + 1);
        line = line + '<br>';
        result += line;
        index = remaining.indexOf('\n');
      }
      $('#edit-area').html(result);
    });

    input.on('end', function() {
      if (!flag) {
        result += '<br>';
        $('#edit-area').html(result);
      }
    });
  }
  var input = fs.createReadStream('./resources/texts/public_host.txt');
  readLines(input);
  $('#edit-area').attr('contenteditable', true);
});

$('#current-host').click(function() {
  if ($('.active-li')) {
    $('.active-li').removeClass('active-li');
  }
  $(this).addClass('active-li');
  var result = '';
  var fs = require('fs');

  function readLines(input) {
    var remaining = '',
      flag = false;
    input.on('data', function(data) {
      remaining += data;
      flag = true;
      var index = remaining.indexOf('\n');
      while (index > -1) {
        var line = remaining.substring(0, index);
        remaining = remaining.substring(index + 1);
        line = line + '<br>';
        result += line;
        index = remaining.indexOf('\n');
      }
      $('#edit-area').html(result);
    });

    input.on('end', function() {
      if (!flag) {
        result += '<br>';
        $('#edit-area').html(result);
      }
    });
  }
  var input = fs.createReadStream('/etc/hosts');
  readLines(input);
  $('#edit-area').attr('contenteditable', false);
});

var local_host_list = $('ul#local-host-list').children();
if (local_host_list.length != 0) {
  local_host_list.click(function() {
    var class_name = $(this).attr('id');
    if ($('.active-li')) {
      $('.active-li').removeClass('active-li');
    }
    $(this).addClass('active-li');
    var result = '',
      flag = false;
    var fs = require('fs');

    function readLines(input) {
      var remaining = '',
        flag = false;
      input.on('data', function(data) {
        remaining += data;
        flag = true;
        var index = remaining.indexOf('\n');
        while (index > -1) {
          var line = remaining.substring(0, index);
          remaining = remaining.substring(index + 1);
          line = line + '<br>';
          result += line;
          index = remaining.indexOf('\n');
        }
        $('#edit-area').html(result);
      });

      input.on('end', function() {
        if (!flag) {
          result += '<br>';
          $('#edit-area').html(result);
        }
      });
    }
    var input = fs.createReadStream('./resources/texts/' + class_name + '_host.txt');
    readLines(input);
    $('#edit-area').attr('contenteditable', true);
  });

  local_host_list.dblclick(function() {
    if ($('.accept')) {
      $('.accept').removeClass('accept');
    }
    $(this).addClass('accept');
    var class_name = $(this).attr('id');


    var fs = require('fs');
    var readStream = fs.createReadStream('./resources/texts/public_host.txt');
    var writeStream = fs.createWriteStream('/etc/hosts');

    readStream.on('data', function(chunk) { // 当有数据流出时，写入数据
        if (writeStream.write(chunk) === false) { // 如果没有写完，暂停读取流
            readStream.pause();
        }
    });

    writeStream.on('drain', function() { // 写完后，继续读取
        readStream.resume();
    });
    var hostReadStream = fs.createReadStream('./resources/texts/' + class_name + '_host.txt');
    hostReadStream.on('data', function(chunk) {
      if (writeStream.write(chunk) == false) {
        hostReadStream.pause();
      }
    });

    writeStream.on('drain', function() { // 写完后，继续读取
        hostReadStream.resume();
    });

    hostReadStream.on('end', function() {
      writeStream.end();
    });
    $('#edit-area').attr('contenteditable', true);
  });
}

$('#root-minus').click(function() {
  var next_ul = $(this).parent().find('ul');
  if (next_ul.length != 0) {
    if ($(this).attr('class').indexOf('fa-minus-square-o') != -1) {
      next_ul.hide();
      $(this).removeClass('fa-minus-square-o');
      $(this).addClass('fa-plus-square-o');
    } else {
      next_ul.show();
      $(this).removeClass('fa-plus-square-o');
      $(this).addClass('fa-minus-square-o');
      if ($('#local-host-list').length != 0) {
        var next_minus = $('#local-host-list').parent().find('i').first();
        if (next_minus.attr('class').indexOf('fa-plus-square-o') != -1) {
          $('#local-host-list').hide();
        }
      }
      if ($('#online-host-list').length != 0) {
        var next_minus = $('#online-host-list').parent().find('i').first();
        if (next_minus.attr('class').indexOf('fa-plus-square-o') != -1) {
          $('#online-host-list').hide();
        }
      }
    }
  }
});

$('.minus-folder').click(function() {
  var next_ul = $(this).parent().find('ul');
  if (next_ul.length != 0) {
    if ($(this).attr('class').indexOf('fa-minus-square-o') != -1) {
      next_ul.hide();
      $(this).removeClass('fa-minus-square-o');
      $(this).addClass('fa-plus-square-o');
    } else {
      next_ul.show();
      $(this).removeClass('fa-plus-square-o');
      $(this).addClass('fa-minus-square-o');
    }
  }
});

function filterTag(str) {
  return str.replace(/(\<div\>)/gm, "")
  .replace(/&nbsp;&nbsp;&nbsp;&nbsp;/g, "\t")
  .replace(/&nbsp;/g, '')
  .replace(/(\<br\>\<\/div\>)/g, "\n")
  .replace(/(\<\/div\>)/g, "\n")
  .replace(/(\<br\>)/g, "\n");
}

$('#edit-area').keydown(function(event) {
    if (event.which == 9) {
      var tabSpace = '&nbsp;&nbsp;&nbsp;&nbsp;';
      if (document.all){
        document.selection.createRange().pasteHTML(tabSpace);
      } else {
        document.execCommand('InsertHtml', null, tabSpace);
      }
      return false;
    }
    if (event.which == 13) {
      if (($('#edit-area').html().indexOf('<div>') == -1 && $('#edit-area').html().indexOf('<br>') == -1) && $('#edit-area').html().length != 0) {
        if (window.getSelection) {
          var selection = window.getSelection(),
              range = selection.getRangeAt(0),
              br = document.createElement("br");
          range.deleteContents();
          range.insertNode(br);
          range.setStartAfter(br);
          range.setEndAfter(br);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
          return true;
        }
      }
    }

    //19 for Mac Command+S
    if (!( String.fromCharCode(event.which).toLowerCase() == 's' && event.ctrlKey) && !(event.which == 19)) return true;

    var fs = require('fs'),
      html_str = $(this).html(),
      file_name_prefix = $('.active-li').attr('id');

    if (file_name_prefix == 'public-host') {
      file_name_prefix = 'public';
    }

    if (file_name_prefix == 'current-host') {
      return false;
    }

    if (html_str.indexOf('<br>') == -1 && html_str.length != 0) {
      html_str += "<br>";
    }
    var data = filterTag(html_str);
    var writerStream = fs.createWriteStream('./resources/texts/' + file_name_prefix + '_host.txt');
    writerStream.write(data, 'UTF8');
    writerStream.end();

    writerStream.on('finish', function() {
        console.log("saved finish");
    });

    writerStream.on('error', function(err){
       console.log(err.stack);
    });

    event.preventDefault();
    return false;
});

$('#add-btn').on('click', function() {
  $('#bg').show();
  $('#add-form').show();
});

$('#refresh-btn').on('click', function() {
  alert('click refresh');
});

$('#edit-btn').on('click', function() {
  alert('click edit');
});

$('#del-btn').on('click', function() {
  alert('click del');
});

$('#cancel-btn').on('click', function() {
  $('#bg').hide();
  $('#add-form').hide();
});

$('#bg').on('click', function() {
  $('#bg').hide();
  $('#add-form').hide();
});

$('#ok-btn').on('click', function() {
  
});
