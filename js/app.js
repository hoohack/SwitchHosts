var gui = require('nw.gui');
var path = require('path');
var mkdirp = require('mkdirp');
var os = require('os');
var dataPath = gui.App.dataPath,
  cfgPath = path.join(dataPath, "/config"),
  hostPath = path.join(dataPath, "/host"),
  os_type = os.type();
var sysHostPath = '/etc/hosts';
if (os_type == 'Windows_NT')
{
  sysHostPath = "C:\\Windows\\System32\\drivers\\etc\\hosts";
}

var $localHostList = $('#local-host-list'),
  $defaultHostList = $('#default-list');

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

function updateDefaultIcon(node_id, icon)
{
  var fs = require('fs');
  var data = fs.readFileSync(cfgPath + '/defaultList.json'),
    hostList = JSON.parse(data);
  $.each(hostList, function(idx, obj) {
    if (obj.id == node_id) {
      obj.img_name = icon + '.png';
    }
  });

  writeConfigFile('defaultList.json', hostList);
  $('#' + node_id +' img').attr('src', './resources/images/' + icon + '.png');
}

function updateIcon(node_id, icon)
{
  var fs = require('fs');
  var data = fs.readFileSync(cfgPath + '/hostList.json'),
    hostList = JSON.parse(data);
  $.each(hostList, function(idx, obj) {
    if (obj.id == node_id) {
      obj.img_name = icon + '.png';
    }
  });
  writeConfigFile('hostList.json', hostList);
  $('#' + node_id +' img').attr('src', './resources/images/' + icon + '.png');
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

  var fs = require('fs'),
    html_str = $('#edit-area').html(),
    file_name_prefix = $('.active-li').attr('id');

  if (html_str.indexOf('<br>') == -1 && html_str.length != 0) {
    html_str += "<br>";
  }
  var data = filterTag(html_str);
  var writerStream = fs.createWriteStream(hostPath + '/' + file_name_prefix);
  writerStream.write(data, 'UTF8');
  writerStream.end();

  writerStream.on('finish', function() {
      console.log("saved finish");
  });

  writerStream.on('error', function(err){
     console.log(err.stack);
  });

  var fs = require('fs');
  var readStream = fs.createReadStream(hostPath + '/public');
  var writeStream = fs.createWriteStream(sysHostPath);

  readStream.on('data', function(chunk) { // 当有数据流出时，写入数据
      if (writeStream.write(chunk) === false) { // 如果没有写完，暂停读取流
          readStream.pause();
      }
  });

  writeStream.on('drain', function() { // 写完后，继续读取
      readStream.resume();
  });
  var hostReadStream = fs.createReadStream(hostPath + '/' + class_name);
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
    var writerStream = fs.createWriteStream(hostPath + '/' + file_name_prefix);
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

function initHostList()
{
  var cfg = [
    {"id" : "node1","name" : "外网开发","active" : false,"img_name" : "icon_1.png"},
    {"id" : "node2","name" : "什么都没有","active" : false,"img_name" : "icon_2.png"}
  ];
  return cfg;
}

function initDefaultList()
{
  var cfg = [
    {"id":"current-host","name":"当前hosts","active":true,"img_name":"icon_6.png"},
    {"id":"public-host","name":"公用hosts","active":false,"img_name":"icon_0.png"}
  ];
  return cfg;
}

function readDefaultList()
{
    var fs = require('fs');
    var cfg = {};
    if (!fs.existsSync(cfgPath))
    {
        console.log(cfgPath + " is not found");
        fs.mkdir(cfgPath);
        cfg = initDefaultList();
        writeConfigFile("defaultList.json", cfg);
    }
    else
    {
        if(!fs.existsSync(cfgPath + '/defaultList.json'))
        {
            console.log(cfgPath+'/defaultList.json'+" is not found");
            cfg = initDefaultList();
            writeConfigFile("defaultList.json", cfg);
        }
        else
        {
            var data = fs.readFileSync(cfgPath+'/defaultList.json');
            try {
              cfg = JSON.parse(data);
            } catch(e) {
              cfg = initDefaultList();
            }
        }
    }
    $.each(cfg, function(idx, obj) {
      if (obj.id == 'public-host')
      {
        writeDefaultFile('public', "# 这里是公用host\n");
      }
    });
    return cfg;
}

function readHostList()
{
    var fs = require('fs');
    var cfg = {};
    if (!fs.existsSync(cfgPath))
    {
        console.log(cfgPath + " is not found");
        fs.mkdir(cfgPath);
        cfg = initHostList();
        writeConfigFile("hostList.json", cfg);
    }
    else
    {
        if(!fs.existsSync(cfgPath + '/hostList.json'))
        {
            console.log(cfgPath+'/hostList.json' + " is not found");
            cfg = initHostList();
            writeConfigFile("hostList.json", cfg);
        }
        else
        {
            var data = fs.readFileSync(cfgPath+'/hostList.json');
            try {
              cfg = JSON.parse(data);
            } catch(e) {
              cfg = initHostList();
            }
        }
    }
    $.each(cfg, function(idx, obj) {
      writeDefaultFile(obj.id, "# 这里是" + obj.name + "\n");
    });
    return cfg;
}

function writeConfigFile(file_name, hostList)
{
  var fs = require('fs');
  var file_path = cfgPath + '/' + file_name;
  mkdirp.sync(cfgPath, function (err) {
      if (err) console.error(err)
      else console.log("Making directory: "+cfgPath);
  });
  fs.writeFile(file_path, JSON.stringify(hostList));
}

function writeDefaultFile(file_name, content)
{
  var fs = require('fs');
  var file_path = hostPath + '/' + file_name;
  if (!fs.existsSync(file_path))
  {
    mkdirp.sync(hostPath, function (err) {
        if (err) console.error(err)
        else console.log("Making directory: "+hostPath);
    });
    fs.writeFile(file_path, content);
  }
}

function addNode(node_id, node_text, img_name, active)
{
    var new_node = $('<li></li>'),
      node_span = $('<span></span>'),
      node_img = $('<img>');
    node_span.html(node_text);
    new_node.attr('id', node_id);
    new_node.addClass('leaf-node');
    if (active == 1)
    {
      new_node.addClass('accept');
    }
    node_img.attr('src', "./resources/images/" + img_name);
    new_node.append(node_img);
    new_node.append(node_span);
    $localHostList.append(new_node);
}

function addHost()
{
  if ($('#host-name').val().length != 0) {
    var fs = require('fs');
    var hostData = fs.readFileSync(cfgPath + '/hostList.json'),
      img_idx = parseInt(Math.random() * 6 + 1),
      hostList = JSON.parse(hostData),
      already_have = false;

    $.each(hostList, function(idx, obj) {
      if (obj.name == $('#host-name').val()) {
        already_have = true;
        return;
      }
    });

    if (already_have)
    {
      alert('已经有名为"' + $('#host-name').val() + '"的方案了');
      return;
    }
    var host_name = 'node' + (hostList.length+1);
    var file_name = hostPath + '/' + host_name;

    writeDefaultFile(host_name, "# 这里是" + $('#host-name').val() + "\n");
    var idx = hostList.length;
    hostList[idx] = {"id" : "node" + (idx+1), "name" : $('#host-name').val(), "active" : false, "img_name" : "icon_" + img_idx + ".png"};
    writeConfigFile('hostList.json', hostList);
    $('#bg').hide();
    $('#add-form').hide();
    window.location.reload();
  }
}

function saveHost()
{
  if ($('#new-host-name').val().length != 0) {
    var fs = require('fs'),
      node_id = $('.active-li').attr('id'),
      new_val = $('#new-host-name').val();
    var hostData = fs.readFileSync(cfgPath + '/hostList.json'),
      hostList = JSON.parse(hostData),
      already_have = false;

    $.each(hostList, function(idx, obj) {
      if (obj.name == new_val) {
        already_have = true;
        return;
      }
    });

    if (already_have)
    {
      alert('已经有名为"' + new_val + '"的方案了');
      return;
    }

    $.each(hostList, function(idx, obj) {
      if (obj.id == node_id) {
        obj.name = new_val;
      }
    });

    writeConfigFile('hostList.json', hostList);
    $('#' + node_id + ' span').html(new_val);
    $('#bg').hide();
    $('#edit-form').hide();
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
      var hostData = fs.readFileSync(cfgPath + '/hostList.json'),
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
      var hostData = fs.readFileSync(cfgPath + '/hostList.json'),
        hostList = JSON.parse(hostData);
        var index = -1;
        $.each(hostList, function(idx, obj) {
          if (obj.id == node_id) {
            index = idx;
          }
        });
        if (index != -1) {
          hostList.splice(index, 1);
          writeConfigFile('hostList.json', hostList);
          $('#' + node_id).remove();
          fs.unlink(hostPath + '/' + node_id, function (err) {
            if (err)
              return console.error(err);
            console.log("file delete success");
          });
        }
    }
  }
}

function addRightBtnClick()
{
  $.contextMenu({
      selector: '.leaf-node',
      items: {
          "switch": {
            name: "切换到当前hosts",
            callback: function(key, options) {
              var node_id = $('.active-li').attr('id');
              var node = $('#' + node_id);
              acceptHosts(node);
            }
          },
          "edit": {
            name: "编辑",
            callback: function(key, options) {
              editHosts();
            }
          },
          "refresh": {
            name: "刷新",
            callback: function(key, options) {
              var node_id = $('.active-li').attr('id');
              var node = $('#' + node_id);
              setActiveLi(node);

              var fs = require('fs'),
                input = fs.createReadStream(hostPath + '/' + node_id);
              readLines(input);
              $('#edit-area').attr('contenteditable', true);
            }
          },
          "delete": {
            name: "删除",
            callback: function(key, options) {
              var r = confirm("确定要删除吗？");
              if (r == true)
              {
                delHosts();
              }
            }
          },
          "icon": {
            "name": "图标",
            "items": {
                "图标0": {
                  "name": "图标0",
                  "icon": function() {
                    return 'context-menu-icon context-menu-icon-icon_0'
                  },
                  callback: function(key, options) {
                    var node_id = $('.active-li').attr('id');
                    var node = $('#' + node_id);
                    updateIcon(node_id, 'icon_0');
                  }
                },
                "图标1": {
                  "name": "图标1",
                  "icon": function() {
                    return 'context-menu-icon context-menu-icon-icon_1'
                  },
                  callback: function(key, options) {
                    var node_id = $('.active-li').attr('id');
                    var node = $('#' + node_id);
                    updateIcon(node_id, 'icon_1');
                  }
                },
                "图标2": {
                  "name": "图标2",
                  "icon": function() {
                    return 'context-menu-icon context-menu-icon-icon_2'
                  },
                  callback: function(key, options) {
                    var node_id = $('.active-li').attr('id');
                    var node = $('#' + node_id);
                    updateIcon(node_id, 'icon_2');
                  }
                },
                "图标3": {
                  "name": "图标3",
                  "icon": function() {
                    return 'context-menu-icon context-menu-icon-icon_3'
                  },
                  callback: function(key, options) {
                    var node_id = $('.active-li').attr('id');
                    var node = $('#' + node_id);
                    updateIcon(node_id, 'icon_3');
                  }
                },
                "图标4": {
                  "name": "图标4",
                  "icon": function() {
                    return 'context-menu-icon context-menu-icon-icon_4'
                  },
                  callback: function(key, options) {
                    var node_id = $('.active-li').attr('id');
                    var node = $('#' + node_id);
                    updateIcon(node_id, 'icon_4');
                  }
                },
                "图标5": {
                  "name": "图标5",
                  "icon": function() {
                    return 'context-menu-icon context-menu-icon-icon_5'
                  },
                  callback: function(key, options) {
                    var node_id = $('.active-li').attr('id');
                    var node = $('#' + node_id);
                    updateIcon(node_id, 'icon_5');
                  }
                },
                "图标6": {
                  "name": "图标6",
                  "icon": function() {
                    return 'context-menu-icon context-menu-icon-icon_6'
                  },
                  callback: function(key, options) {
                    var node_id = $('.active-li').attr('id');
                    var node = $('#' + node_id);
                    updateIcon(node_id, 'icon_6');
                  }
                }
            }
          }
      }
  });
  $.contextMenu({
      selector: '.default-node',
      items: {
          "switch": {
            name: "切换到当前hosts",
            disabled: true
          },
          "edit": {
            name: "编辑",
            disabled: true
          },
          "refresh": {
            name: "刷新",
            callback: function(key, options) {
              var node_id = $('.active-li').attr('id');
              var node = $('#' + node_id);
              setActiveLi(node);

              var fs = require('fs'),
                input = fs.createReadStream('./resources/texts/' + node_id + '_host.txt');
              readLines(input);
              $('#edit-area').attr('contenteditable', true);
            }
          },
          "delete": {
            name: "删除",
            disabled: true
          },
          "icon": {
            "name": "图标",
            "items": {
                "图标0": {
                  "name": "图标0",
                  "icon": function() {
                    return 'context-menu-icon context-menu-icon-icon_0'
                  },
                  callback: function(key, options) {
                    updateDefaultIcon($(this).attr('id'), 'icon_0');
                  }
                },
                "图标1": {
                  "name": "图标1",
                  "icon": function() {
                    return 'context-menu-icon context-menu-icon-icon_1'
                  },
                  callback: function(key, options) {
                    updateDefaultIcon($(this).attr('id'), 'icon_1');
                  }
                },
                "图标2": {
                  "name": "图标2",
                  "icon": function() {
                    return 'context-menu-icon context-menu-icon-icon_2'
                  },
                  callback: function(key, options) {
                    updateDefaultIcon($(this).attr('id'), 'icon_2');
                  }
                },
                "图标3": {
                  "name": "图标3",
                  "icon": function() {
                    return 'context-menu-icon context-menu-icon-icon_3'
                  },
                  callback: function(key, options) {
                    updateDefaultIcon($(this).attr('id'), 'icon_3');
                  }
                },
                "图标4": {
                  "name": "图标4",
                  "icon": function() {
                    return 'context-menu-icon context-menu-icon-icon_4'
                  },
                  callback: function(key, options) {
                    updateDefaultIcon($(this).attr('id'), 'icon_4');
                  }
                },
                "图标5": {
                  "name": "图标5",
                  "icon": function() {
                    return 'context-menu-icon context-menu-icon-icon_5'
                  },
                  callback: function(key, options) {
                    updateDefaultIcon($(this).attr('id'), 'icon_5');
                  }
                },
                "图标6": {
                  "name": "图标6",
                  "icon": function() {
                    return 'context-menu-icon context-menu-icon-icon_6'
                  },
                  callback: function(key, options) {
                    updateDefaultIcon($(this).attr('id'), 'icon_6');
                  }
                }
            }
          }
      }
  });
}

$('#add-btn').on('click', function() {
  $('#bg').show();
  $('#add-form').show();
  bindOkBtn();
  bindEnterBtn();
});

$('#refresh-btn').on('click', function() {
  if ($('.active-li').length != 0)
  {
    var node_id = $('.active-li').attr('id');
    if (node_id != 'public-host' && node_id != 'current-host')
    {
      console.log('refreshing...');
      var fs = require('fs'),
        input = fs.createReadStream(hostPath + '/' + node_id);
      readLines(input);
      $('#edit-area').attr('contenteditable', true);
    }
  }
  else {
    window.location.reload();
  }
});

$('#edit-btn').on('click', function() {
  editHosts();
});

$('#del-btn').on('click', function() {
  var r = confirm("确定要删除吗？");
  if (r == true)
  {
    delHosts();
  }
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
    alert('更换host成功,当前使用的hosts方案是 ' + node.find('span').html());
  }
});
