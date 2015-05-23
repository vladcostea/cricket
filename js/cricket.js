function gui(containerId, game) {
  var self = this;
  var $container = $('#' + containerId);
  var $playerModal = $('#player-modal');

  self.game = game;

  self.wireEvents = function() {
    $('.player-button').on('click', function(event) {
      event.preventDefault();
      // update modal ui
      // first get the player object using it's id
      var player = self.game.findPlayer( $(this).data('player-id') );
      // set modal title to player name
      $playerModal.find('.modal-title').text(player.name);
      // set player strikes
      $playerModal.find('.player-strikes tbody').empty();
      $.each(player.strikes, function(strike, times) {
        $playerModal.find('.player-strikes tbody').append(self.playerStrike(strike, times));
      });
      // show the modal
      $playerModal.modal('show');
    });
  }

  self.clearContainer = function() {
    $container.empty();
  }

  self.playerButton = function(player) {
    var html = "<a href='#player-modal' class='player-button clearfix' data-player-id='" + player.id + "'>";
    html += '<span class="name">' + player.name + '</span> - ';
    html += '<span class="score">' + player.score + '</span>';
    html += '</a>';
    return html;
  }

  self.playerStrike = function(strike, times) {
    var html = '<tr><td class="strike">' + strike + '</td><td class="times">' + times;
    html += '<button class="btn btn-xs btn-primary btn-add-strike" data-strike="' + strike + '">';
    html += '<i class="fa fa-fw fa-plus"></i></button>';
    html += '</td>';
    return html;
  }

  self.addPlayerButton = function(player) {
    $container.append( self.playerButton(player) );
  }
}

function Cricket(containerId) {
  var self = this;
  self.gui = new gui(containerId, self);
  self.players = [];

  self.init = function(seedPlayers) {
    self.gui.clearContainer();

    if (seedPlayers) {
      self.players = seedPlayers;
      self.initFromSeedData(seedPlayers);
    }

    self.gui.wireEvents();
  }

  self.initFromSeedData = function(players) {
    for(var i = 0; i < players.length; i++) {
      self.gui.addPlayerButton(players[i]);
    }
  }

  self.findPlayer = function(playerId) {
    return $.grep(players, function(player, index) {
      return player.id == playerId;
    })[0];
  }
}