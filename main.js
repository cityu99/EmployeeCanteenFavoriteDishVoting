// 初始化 LeanCloud 应用
AV.init({
  appId: 'YourAppID',
  appKey: 'YourAppKey'
});

// 获取当前投票菜品类型
var typeQuery = new AV.Query('VoteConfig');
typeQuery.first().then(function(voteConfig) {
  if (voteConfig) {
      var currentType = voteConfig.get('type');
      $('#currentType').text(currentType);
      queryMenuItems(currentType);
  }
});

// 查询菜品列表
function queryMenuItems(type) {
  var query = new AV.Query('MenuItem');
  query.equalTo('type', type);
  query.find().then(function(results) {
      var menuList = $('#menu-list');

      menuList.empty();

      results.forEach(function(menuItem) {
          var name = menuItem.get('name');
          var votes = menuItem.get('votes');
          var objectId = menuItem.id;

          var listItem = $('<div>').addClass('menu-item');
          listItem.append($('<span>').text(name + ': ' + votes + ' 票'));
          listItem.append($('<button>').text('投票').data('objectId', objectId));

          listItem.appendTo(menuList);
      });
  });

  queryVoteResults(type);
}

// 查询投票结果
function queryVoteResults(type) {
  var query = new AV.Query('MenuItem');
  query.equalTo('type', type);
  query.descending('votes');
  query.find().then(function(results) {
      var resultDiv = $('#result');

      resultDiv.empty();

      results.forEach(function(result) {
          var name = result.get('name');
          var votes = result.get('votes');

          var itemDiv = $('<div>').text(name + ': ' + votes + ' 票');
          resultDiv.append(itemDiv);
      });
  });
}

// 监听投票按钮点击事件
$(document).on('click', 'button', function() {
  var objectId = $(this).data('objectId');

  // 原子操作：将对应菜品的投票数 +1
  AV.Object.createWithoutData('MenuItem', objectId)
      .increment('votes', 1)
      .save()
      .then(function() {
          alert('投票成功！');
          queryVoteResults($('#currentType').text());
      })
      .catch(function(error) {
          console.error('投票失败：', error);
      });
});

// 监听更换投票菜品类型按钮点击事件
$('#changeTypeButton').click(function() {
  var newType = prompt('请输入新的投票菜品类型：');
  if (newType) {
      // 更新当前投票菜品类型
      var typeQuery = new AV.Query('VoteConfig');
      typeQuery.first().then(function(voteConfig) {
          if (voteConfig) {
              voteConfig.set('type', newType);
          } else {
              voteConfig = new AV.Object('VoteConfig');
              voteConfig.set('type', newType);
          }
          return voteConfig.save();
      }).then(function() {
          $('#currentType').text(newType);
          queryMenuItems(newType);
          alert('更换投票菜品类型成功！');
      }).catch(function(error) {
          console.error('更换投票菜品类型失败：', error);
      });
  }
});
