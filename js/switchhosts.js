var SwitchHosts = (function() {
  var hostList = {};
  var defaultHostList = {};

  defaultHostList = readDefaultList();
  hostList = readHostList();

  function addMenu()
  {
    //设置菜单
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
  }

  function bindDefaultClick()
  {
    $('#public-host').click(function() {
      clearGray();
      setActiveLi($(this));

      var fs = require('fs'),
        input = fs.createReadStream(hostPath + '/public');
      readLines(input);
      $('#edit-area').attr('contenteditable', true);
      disableBtn($('#del-btn'));
      disableBtn($('#edit-btn'));
    });

    $('#current-host').click(function() {
      clearGray();
      setActiveLi($(this));

      var fs = require('fs'),
        input = fs.createReadStream(sysHostPath);
      readLines(input);
      $('#edit-area').attr('contenteditable', false);
      disableBtn($('#del-btn'));
      disableBtn($('#edit-btn'));
    });
  }

  function start()
  {
    console.log('starting...');
    addMenu();
    if ($('.default-node').length == 2) {
      console.log('excute');
      $('#default-list li').first().remove();
      $('#default-list li').first().remove();
    }
    loadDefaultList();
    bindDefaultClick();
    $localHostList.empty();
    loadHostList();
    bindClick();
    addRightBtnClick();
  }

  function loadDefaultList()
  {
    $.each(defaultHostList, function(idx, obj) {
      if ($('#' + obj.id).length == 0) {
        var new_node = $('<li></li>'),
          node_span = $('<span></span>'),
          node_img = $('<img>');
        node_span.html(obj.name);
        new_node.attr('id', obj.id);
        new_node.addClass('second-tree');
        new_node.addClass('default-node');
        node_img.attr('src', "./resources/images/" + obj.img_name);
        new_node.append(node_img);
        new_node.append(node_span);
        $defaultHostList.prepend(new_node);
      }
    });
  }

  function loadHostList()
  {
    $.each(hostList, function(idx, obj) {
      if ($('#' + obj.id).length == 0) {
        addNode(obj.id, obj.name, obj.img_name, obj.active);
      }
    });
  }

  function bindClick()
  {
    var local_host_list = $('ul#local-host-list').children();
    if (local_host_list.length != 0) {
      local_host_list.click(function() {
        var node = $(this).attr('id');
        clearGray();
        setActiveLi($(this));

        var fs = require('fs'),
          input = fs.createReadStream(hostPath + '/' + node);
        readLines(input);
        $('#edit-area').attr('contenteditable', true);
      });

      local_host_list.dblclick(function() {
        acceptHosts($(this));
        alert('更换host成功,当前使用的hosts方案是 ' + $(this).find('span').html());
      });
    }
  }

  return {
    start : start
  }
})();
