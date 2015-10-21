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
  var fs = require('fs');
  fs.readFile('./resources/texts/public_host.txt', function (err, data) {
     if (err) {
         return console.error(err);
     }
     $('#edit-area').html(data.toString());
  });
});

$('#public-host').dblclick(function() {
  alert('double click');
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
        line = line + '<br />';
        result += line;
        index = remaining.indexOf('\n');
      }
      $('#edit-area').html(result);
    });

    input.on('end', function() {
      if (!flag) {
        result += '<br />';
        $('#edit-area').html(result);
      }
    });
  }
  var input = fs.createReadStream('/etc/hosts');
  readLines(input);

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
      var remaining = '';
      input.on('data', function(data) {
        remaining += data;
        var index = remaining.indexOf('\n');
        while (index > -1) {
          var line = remaining.substring(0, index);
          remaining = remaining.substring(index + 1);
          line = line + '<br />';
          result += line;
          index = remaining.indexOf('\n');
        }
        $('#edit-area').html(result);
      });

      input.on('end', function() {
        if (!flag) {
          result += '<br />';
          $('#edit-area').html(result);
        }
      });
    }
    var input = fs.createReadStream('./resources/texts/' + class_name + '_host.txt');
    readLines(input);
  });

  local_host_list.dblclick(function() {
    if ($('.accept')) {
      $('.accept').removeClass('accept');
    }
    $(this).addClass('accept');
    var class_name = $(this).attr('id');
    var fs = require('fs');

    function writeLines(input) {
      input.on('data', function(data) {
        fs.open("/etc/hosts", "w", 0666, function(e,fd){
            if(e) throw e;
            fs.write(fd, data , 0, 'utf8',function(e){
                if(e) throw e;
                // fs.closeSync(fd);
            });
        });
      });
    }

    function addContent(input) {
      input.on('data', function(data) {
        console.log(data);
        fs.open("/etc/hosts", "a" , 0666, function(e,fd){
          if(e) throw e;
          fs.write(fd, data, function(e){
              if(e) throw e;
              // fs.closeSync(fd);
          });
        });
      });
    }
    var public_content = fs.createReadStream('./resources/texts/public_host.txt');
    public_content.setEncoding('UTF8');
    writeLines(public_content);
    var host_content = fs.createReadStream('./resources/texts/' + class_name + '_host.txt');
    host_content.setEncoding('UTF8');
    addContent(host_content);
  });
}
