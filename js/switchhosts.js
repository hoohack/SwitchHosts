var SwitchHosts = (function() {
  var $localHostList = $('#local-host-list');
  var hostList;

  function start()
  {
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
  }

  return {
    start : start
  }
})();
