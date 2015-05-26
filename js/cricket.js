function gui(boardClass, game) {
  var self = this;

  self.game = game;
  self.$board = $('.' + boardClass);
  self.$events = $('.events');

  self.wireEvents = function() {

    $.each(self.game.players, function(i, player) {
      self.handlePlayerEvents(player);
    });

    self.handleNewPlayer();

    self.handleReset();
  }

  self.handleNewPlayer = function() {
    $('.new-player-button').on('click', function(event) {
      var $input = $('.new-player-input');
      var newPlayerName = $input.val();
      if (newPlayerName) {
        // create the new player
        player = self.game.createPlayer(newPlayerName);
        // update the ui
        self.addPlayerRow(player);
        // wire the players' events
        self.handlePlayerEvents(player);
        // clear the input field
        $input.val('');

        self.newPlayerEvent(player);
      }
    });
  }

  self.newPlayerEvent = function(player) {
    self.$events.append('<li class="event join">' + player.name + ' joined the game</li>');
  }

  self.playerStrikeEvent = function(player, strike) {
    self.$events.append('<li class="event strike">' + player.name + ' hit ' + strike + '</li>'); 
  }

  self.playerStrikeAndScoreEvent = function(player, strike, hit) {
    var hitNames = hit.join();

    self.$events.append('<li class="event strike">' + player.name + ' hit ' + hitNames + ' with '+ strike + 'points </li>');  
  }

  self.handlePlayerEvents = function(player) {
    var $playerRow = self.$board.find('tr[data-player-id="' + player.id + '"]');

    $playerRow.find('.strike-button').on('click', function(event) {
      event.preventDefault();

      var $button = $(this);
      // var player = self.game.findPlayer($button.data('player-id'));
      var strike = $button.data('strike');
      // perform a strike and see if we need to update player scores;
      var updateScores = self.game.addStrike(player, strike);

      if(player.strikes[strike] == 3 && $button.hasClass('btn-primary')) {
        $button.removeClass('btn-primary');
        $button.addClass('btn-success');
      }

      if (updateScores) {

        $.each(self.game.players, function(index, p) {
          if (p.id != player.id) {
            $('.player-row[data-player-id="' + p.id + '"]').find('td.score').text(p.score);
          }
        });
      } else {
        // update strike times-count for the current player
        $button.text(player.strikes[strike]);
        // $playerModal.find('.player-strikes .times-count[data-strike="' + strike + '"]').text(player.strikes[strike]);  
      }

    });
  }

  self.handleReset = function() {
    $('.reset-button').on('click', function(event) {
      event.preventDefault();

      if (confirm('Clear the board and start again?')) {
        // clear game resources
        self.game.clearPlayers();
        // TODO: after adding events
        // self.game.clearEvents();
        
        // clear gui
        self.clearBoard();
        self.clearEvents();
      }      
    });
  }

  self.clearBoard = function() {
    self.$board.find('tbody').empty();
  }

  self.clearEvents = function() {
    self.$events.find('.event').remove();
  }

  self.playerRow = function(player) {
    var html = '<tr class="player-row" data-player-id="' + player.id + '">';
    html += '<td class="name">' + player.name + '</td>';
    $.each(player.strikes, function(strike, times) {
      html += '<td class="strike-count">';
      html += self.strikeButton(player.id, strike, times);
      html += '</td>';
    });
    html += '<td class="score">' + player.score + '</td>';
    return html;
  }

  self.addPlayerRow = function(player) {
    self.$board.find('tbody').append( self.playerRow(player) );
  }

  self.strikeButton = function(playerId, strike, times) {
    var html = '<button type="button" class="btn btn-primary strike-button" ';
    html += 'data-player-id=" ' + playerId;
    html += '"data-strike="' + strike + '">';
    html += times;
    html += '</button>';
    return html;
  }
}

function Cricket(boardClass) {
  var self = this;
  self.gui = new gui(boardClass, self);

  self.players = [];

  self.init = function(seedPlayers) {
    self.gui.clearBoard();

    if (seedPlayers) {
      self.players = seedPlayers;
      self.initFromSeedData(seedPlayers);
    }

    self.gui.wireEvents();
  }

  self.initFromSeedData = function(players) {
    for(var i = 0; i < players.length; i++) {
      self.gui.addPlayerRow(players[i]);
    }
  }

  self.findPlayer = function(playerId) {
    return $.grep(players, function(player, index) {
      return player.id == playerId;
    })[0];
  }

  self.createPlayer = function(newPlayerName) {
    var id = self.players.length + 1;
    player = {
      id: id,
      name: newPlayerName,
      score: 0,
      strikes: { '15': 0, '16': 0, '17': 0, '18': 0, '19': 0, '20': 0, '25': 0 }
    };

    self.players.push(player);

    return player;
  }

  self.addStrike = function(player, strike) {
    var updateScores = false;
    
    if (player.strikes[strike] < 3) {
      // add a new strike for that number if it's below 3 strikes
      player.strikes[strike]++;
      self.gui.playerStrikeEvent(player, strike);
    } else {
      // update all other player scores
      updateScores = true;
      var hitPlayers = []

      $.each(self.players, function(index, p) {
        if (p.id != player.id && p.strikes[strike] < 3) {
          hitPlayers.push(p.name);
          p.score += parseInt(strike);
        }
      });

      self.gui.playerStrikeAndScoreEvent(player, strike, hitPlayers);
    }

    return updateScores;
  }

  self.clearPlayers = function() {
    self.players = [];
  }
}