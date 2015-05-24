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
        $playerModal.find('.player-strikes tbody').append(self.playerStrike(strike, times, player.id));
      });
      // wire btn-add-strike
      $('.btn-add-strike').on('click', function(event) {
        var strike = $(this).data('strike');
        // perform a strike and see if we need to update player scores;
        var updateScores = self.game.addStrike(player, strike);

        if (updateScores) {
          $.each(self.game.players, function(index, p) {
            if (p.id != player.id) {
              $('.player-button[data-player-id="' + p.id + '"] .score').text(p.score);
            }
          });
        } else {
          // update strike times-count for the current player
          $playerModal.find('.player-strikes .times-count[data-strike="' + strike + '"]').text(player.strikes[strike]);  
        }
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
    html += self.playerButtonStrikes(player);
    html += '</a>';
    return html;
  }

  self.playerButtonStrikes = function(player) {
    var html = '<table class="table strikes"><tbody>';
    var open = [], closed = [];
    $.each(player.strikes, function(strike, times) {
      if (player.strikes[strike] == 3) {
        closed.push(strike);
      } else {
        open.push(strike);
      }
    });

    html += '<tr><td class="title">Closed</td><td class="numbers">' + closed + '</td></tr>';
    html += '<tr><td class="title">Open</td><td class="numbers">' + open + '</td></tr>';
    return html + '</tbody></table>';
  }

  self.playerStrike = function(strike, times, playerId) {
    var html = '<tr><td class="strike">' + strike + '</td><td class="times">';
    html += '<span class="times-count" data-strike="' + strike + '">' + times + '</span>';
    html += '<button class="btn btn-xs btn-primary btn-add-strike" data-player-id="' + playerId + '" data-strike="' + strike + '">';
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

  self.addStrike = function(player, strike) {
    var updateScores = false;
    
    if (player.strikes[strike] < 3) {
      // add a new strike for that number if it's below 3 strikes
      player.strikes[strike]++;
    } else {
      // update all other player scores
      updateScores = true;

      $.each(self.players, function(index, p) {
        console.log(p);
        if (p.id != player.id && p.strikes[strike] < 3) {
          p.score += parseInt(strike);
        }
      });
    }

    return updateScores;
  }
}