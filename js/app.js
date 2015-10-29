function setActiveLi(node)
{
  if ($('.active-li')) {
    $('.active-li').removeClass('active-li');
  }
  node.addClass('active-li');
}

function readLines(input) {
  var remaining = '',
    flag = false,
    result = '';
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

function removeMinus(n_ul, node)
{
  n_ul.hide();
  node.removeClass('fa-minus-square-o');
  node.addClass('fa-plus-square-o');
}

function addMinus(n_ul, node)
{
  n_ul.show();
  node.removeClass('fa-plus-square-o');
  node.addClass('fa-minus-square-o');
}

function updateIcon(node_id, icon)
{
  var fs = require('fs');
  var data = fs.readFileSync('./hostList.json'),
    hostList = JSON.parse(data);
  $.each(hostList, function(idx, obj) {
    if (obj.id == node_id) {
      obj.img_name = icon + '.png';
    }
  });

  fs.writeFile('./hostList.json', JSON.stringify(hostList), function(err) {
    if (err)
      return console.error(err);
    SwitchHosts.start();
  });

}

function clearGray()
{
  if ($('.gray').length != 0)
  {
    $('.gray').removeClass('gray');
  }
}

function disableBtn(btn)
{
  if (!btn.hasClass('gray'))
  {
    btn.addClass('gray');
  }
}

function enableBtn(btn)
{
  if (btn.attr('class').indexOf('gray') != -1)
  {
    btn.removeClass('gray');
  }
}

function acceptHosts(node)
{
  if ($('.accept')) {
    $('.accept').removeClass('accept');
  }
  node.addClass('accept');
  var class_name = node.attr('id');


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
}

$('#public-host').click(function() {
  clearGray();
  setActiveLi($(this));

  var fs = require('fs'),
    input = fs.createReadStream('./resources/texts/public_host.txt');
  readLines(input);
  $('#edit-area').attr('contenteditable', true);
  disableBtn($('#del-btn'));
  disableBtn($('#edit-btn'));
});

$('#current-host').click(function() {
  clearGray();
  setActiveLi($(this));

  var fs = require('fs'),
    input = fs.createReadStream('/etc/hosts');
  readLines(input);
  $('#edit-area').attr('contenteditable', false);
  disableBtn($('#del-btn'));
  disableBtn($('#edit-btn'));
});

$('#root-minus').click(function() {
  var next_ul = $(this).parent().find('ul');
  if (next_ul.length != 0) {
    if ($(this).attr('class').indexOf('fa-minus-square-o') != -1) {
      removeMinus(next_ul, $(this));
    } else {
      addMinus(next_ul, $(this));
      if ($('#local-host-list').length != 0) {
        var next_minus = $('#local-host-list').parent().find('i').first();
        if (next_minus.attr('class').indexOf('fa-plus-square-o') != -1) {
          $('#local-host-list').hide();
        }
      }
    }
  }
});

$('.minus-folder').click(function() {
  var next_ul = $(this).parent().find('ul');
  if (next_ul.length != 0) {
    if ($(this).attr('class').indexOf('fa-minus-square-o') != -1) {
      removeMinus(next_ul, $(this));
    } else {
      addMinus(next_ul, $(this));
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

function addHost()
{
  if ($('#host-name').val().length != 0) {
    var fs = require('fs'),
      pinyin = require("pinyin");
    var hostData = fs.readFileSync('./hostList.json'),
      img_idx = parseInt(Math.random() * 6 + 1),
      hostList = JSON.parse(hostData);
    var host_name = 'node' + (hostList.length+1);
    var file_name = './resources/texts/' + host_name + '_host.txt';
    fs.open(file_name, 'w', function(err, fd) {
       if (err) {
           return console.error(err);
       }
       fs.writeFile(file_name, '#方案 ' + $('#host-name').val() + '\n', function(err) {
         if (err)
          return console.error(err);
          hostList[hostList.length] = {"id" : "node" + (hostList.length+1), "name" : $('#host-name').val(), "active" : false, "img_name" : "icon_" + img_idx + ".png"};
          fs.writeFile('./hostList.json', JSON.stringify(hostList), function(err) {
            if (err)
              return console.error(err);
            SwitchHosts.start();
            $('#bg').hide();
            $('#add-form').hide();
          });
       });
    });
  }
}

function saveHost()
{
  if ($('#new-host-name').val().length != 0) {
    var fs = require('fs'),
      node_id = $('.active-li').attr('id');
    var hostData = fs.readFileSync('./hostList.json'),
      hostList = JSON.parse(hostData);

    $.each(hostList, function(idx, obj) {
      if (obj.id == node_id) {
        obj.name = $('#new-host-name').val();
      }
    });

    fs.writeFile('./hostList.json', JSON.stringify(hostList), function(err) {
      if (err)
        return console.error(err);
      SwitchHosts.start();
      $('#bg').hide();
      $('#edit-form').hide();
    });
  }
}

function bindOkBtn()
{
  $('#ok-btn').on('click', function() {
    addHost();
  });
}

function bindEditOkBtn()
{
  $('#edit-ok-btn').on('click', function() {
    saveHost();
  });
}

function bindEnterBtn()
{
  $('#add-form').keydown(function(event) {
    if (event.which == 13) {
      addHost();
    }
  });
  $('#edit-form').keydown(function(event) {
    if (event.which == 13) {
      saveHost();
    }
  });
}

function editHosts()
{
  if ($('.active-li').length != 0) {
    var cur_node = $('.active-li'),
      node_id = $('.active-li').attr('id');
    if (node_id != 'public-host' && node_id != 'current-host') {
      var fs = require('fs');
      var hostData = fs.readFileSync('./hostList.json'),
        hostList = JSON.parse(hostData);
        var node_name = '';
        $.each(hostList, function(idx, obj) {
          if (obj.id == node_id) {
            node_name = obj.name;
          }
        });
        if (node_name != '') {
          $('#new-host-name').val(node_name);
          $('#bg').show();
          $('#edit-form').show();
          bindEditOkBtn();
          bindEnterBtn();
        }
    }
  }
}

function delHosts()
{
  if ($('.active-li').length != 0) {
    var cur_node = $('.active-li'),
      node_id = $('.active-li').attr('id');
    if (node_id != 'public-host' && node_id != 'current-host') {
      var fs = require('fs');
      var hostData = fs.readFileSync('./hostList.json'),
        hostList = JSON.parse(hostData);
        var index = -1;
        $.each(hostList, function(idx, obj) {
          if (obj.id == node_id) {
            index = idx;
          }
        });
        if (index != -1) {
          hostList.splice(index, 1);
          fs.writeFile('./hostList.json', JSON.stringify(hostList), function(err) {
            if (err)
              return console.error(err);
            SwitchHosts.start();
            fs.unlink('./resources/texts/' + node_id + '_host.txt', function (err) {
              if (err)
                return console.error(err);
              console.log("file delete success");
            });
          });
        }
    }
  }
}

$('#add-btn').on('click', function() {
  $('#bg').show();
  $('#add-form').show();
  bindOkBtn();
  bindEnterBtn();
});

$('#refresh-btn').on('click', function() {
  console.log('refreshing...');
  SwitchHosts.start();
});

$('#edit-btn').on('click', function() {
  editHosts();
});

$('#del-btn').on('click', function() {
  delHosts();
});

$('#cancel-btn').on('click', function() {
  $('#bg').hide();
  $('#add-form').hide();
});

$('#edit-cancel-btn').on('click', function() {
  $('#bg').hide();
  $('#edit-form').hide();
});

$('#bg').on('click', function() {
  $('#bg').hide();
  $('#add-form').hide();
});

$('#accept-btn').on('click', function() {
  var node_id = $('.active-li').attr('id');
  if (node_id != 'public-host' && node_id != 'current-host') {
    var node = $('#' + node_id);
    acceptHosts(node);
  }
});
