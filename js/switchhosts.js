var SwitchHosts = (function() {
  var hostList = {};
  var defaultHostList = {};

  defaultHostList = readDefaultList();
  hostList = readHostList();

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
      $('#accept-btn').hide();
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
      $('#accept-btn').hide();
    });
  }

  function start()
  {
    console.log('starting...');
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
        $('#accept-btn').show();
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
      });
    }
  }

  return {
    start : start
  }
})();
