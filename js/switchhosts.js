var SwitchHosts = (function() {
  var $localHostList = $('#local-host-list');
  var hostList;

  function addMenu()
  {
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
  }

  function start()
  {
    addMenu();
    $localHostList.empty();
    loadHostList();
    bindClick();
  }

  function initHostList()
  {
    var cfg = [
      {
        "id" : "node1",
        "name" : "外网开发",
        "active" : true,
        "img_name" : "icon_1.png"
      },
      {
        "id" : "node2",
        "name" : "什么都没有",
        "active" : false,
        "img_name" : "icon_2.png"
      }
    ];
    return cfg;
  }

  function loadHostList()
  {
    var fs = require('fs');
    var data = fs.readFileSync('./hostList.json');
    try {
      hostList = JSON.parse(data);
    } catch(e) {
      hostList = initHostList();
    }

    $.each(hostList, function(idx, obj) {
      if ($('#' + obj.id).length == 0) {
        var new_node = $('<li></li>'),
          node_span = $('<span></span>'),
          node_img = $('<img>');
        node_span.html(obj.name);
        new_node.attr('id', obj.id);
        new_node.addClass('leaf-node');
        if (obj.active == 1)
        {
          new_node.addClass('accept');
        }
        node_img.attr('src', "./resources/images/" + obj.img_name);
        new_node.append(node_img);
        new_node.append(node_span);
        $localHostList.append(new_node);
      }
    });
  }

  function bindClick()
  {
    var local_host_list = $('ul#local-host-list').children();
    if (local_host_list.length != 0) {
      local_host_list.click(function() {
        var node = $(this).attr('id');
        setActiveLi($(this));

        var fs = require('fs'),
          input = fs.createReadStream('./resources/texts/' + node + '_host.txt');
        readLines(input);
        $('#edit-area').attr('contenteditable', true);
      });

      local_host_list.dblclick(function() {
        acceptHosts($(this));
      });
    }
  }

  return {
    start : start
  }
})();
