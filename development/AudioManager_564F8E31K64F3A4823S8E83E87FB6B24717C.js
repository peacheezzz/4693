var AudioManager;

AudioManager = (function() {

  /**
  * Manages the audio playback of the game.
  *
  * @module gs
  * @class AudioManager
  * @memberof gs
  * @constructor
   */
  function AudioManager() {

    /**
    * Stores all audio buffers.
    * @property buffers
    * @type gs.AudioBuffer[]
    * @protected
     */
    this.audioBuffers = [];

    /**
    * Stores all audio buffers by layer.
    * @property buffers
    * @type gs.AudioBuffer[]
    * @protected
     */
    this.audioBuffersByLayer = [];

    /**
    * Stores all audio buffer references for sounds.
    * @property soundReferences
    * @type gs.AudioBufferReference[]
    * @protected
     */
    this.soundReferences = {};

    /**
    * Current Music (Layer 0)
    * @property music
    * @type Object
    * @protected
     */
    this.music = null;

    /**
    * Current music volume.
    * @property musicVolume
    * @type number
    * @protected
     */
    this.musicVolume = 100;

    /**
    * Current sound volume.
    * @property soundVolume
    * @type number
    * @protected
     */
    this.soundVolume = 100;

    /**
    * Current voice volume.
    * @property voiceVolume
    * @type number
    * @protected
     */
    this.voiceVolume = 100;

    /**
    * General music volume
    * @property generalMusicVolume
    * @type number
    * @protected
     */
    this.generalMusicVolume = 100;

    /**
    * General sound volume
    * @property generalSoundVolume
    * @type number
    * @protected
     */
    this.generalSoundVolume = 100;

    /**
    * General voice volume
    * @property generalVoiceVolume
    * @type number
    * @protected
     */
    this.generalVoiceVolume = 100;

    /**
    * Stores audio layer info-data for each layer.
    * @property audioLayers
    * @type gs.AudioLayerInfo[]
    * @protected
     */
    this.audioLayers = [];
  }


  /**
  * Restores audio-playback from a specified array of audio layers.
  *
  * @method restore
  * @param {gs.AudioLayerInfo[]} layers - An array of audio layer info objects.
   */

  AudioManager.prototype.restore = function(layers) {
    var i, j, layer, len, results;
    this.audioLayers = layers;
    results = [];
    for (i = j = 0, len = layers.length; j < len; i = ++j) {
      layer = layers[i];
      if (layer && layer.playing) {
        if (layer.customData) {
          results.push(this.playMusicRandom(layer, layer.customData.fadeTime, i, layer.customData.playTime, layer.customData.playRange));
        } else {
          results.push(this.playMusic(layer, layer.fadeInTime, i));
        }
      } else {
        results.push(void 0);
      }
    }
    return results;
  };


  /**
  * Loads the specified music.
  *
  * @method loadMusic
  * @param {String} name - The name of the music to load.
   */

  AudioManager.prototype.loadMusic = function(name) {
    var folder, ref;
    if (name != null) {
      folder = (ref = name.folderPath) != null ? ref : "Audio/Music";
      name = name.name || name;
    }
    if (name && name.length > 0) {
      return ResourceManager.getAudioStream(folder + "/" + name);
    }
  };


  /**
  * Loads the specified sound.
  *
  * @method loadSound
  * @param {String} name - The name of the sound to load.
   */

  AudioManager.prototype.loadSound = function(name) {
    var folder, ref;
    if (name != null) {
      folder = (ref = name.folderPath) != null ? ref : "Audio/Sounds";
      name = name.name || name;
    }
    if (name && name.length > 0) {
      return ResourceManager.getAudioBuffer(folder + "/" + name);
    }
  };


  /**
  * Updates a randomly played audio buffer.
  *
  * @method updateRandomAudio
  * @param {gs.AudioBuffer} buffer - The audio buffer to update.
  * @protected
   */

  AudioManager.prototype.updateRandomAudio = function(buffer) {
    var currentTime, timeLeft;
    if (buffer.customData.startTimer > 0) {
      buffer.customData.startTimer--;
      if (buffer.customData.startTimer <= 0) {
        buffer.fadeInVolume = 1.0 / (buffer.customData.fadeTime || 1);
        buffer.fadeInTime = buffer.customData.fadeTime || 1;
        buffer.fadeOutTime = buffer.customData.fadeTime || 1;
        buffer.playTime = buffer.customData.playTime.min + Math.random() * (buffer.customData.playTime.max - buffer.customData.playTime.min);
        currentTime = buffer.currentTime;
        timeLeft = buffer.duration - currentTime;
        buffer.playTime = Math.min(timeLeft * 1000 / 16.6, buffer.playTime);
        return buffer.customData.startTimer = buffer.playTime + buffer.customData.playRange.start + Math.random() * (buffer.customData.playRange.end - buffer.customData.playRange.start);
      }
    }
  };


  /**
  * Updates all audio-buffers depending on the play-type.
  *
  * @method updateAudioBuffers
  * @protected
   */

  AudioManager.prototype.updateAudioBuffers = function() {
    var buffer, j, len, ref;
    ref = this.audioBuffers;
    for (j = 0, len = ref.length; j < len; j++) {
      buffer = ref[j];
      if (buffer != null) {
        if (buffer.customData.playType === 1) {
          this.updateRandomAudio(buffer);
        }
        if (GameManager.settings.bgmVolume !== this.generalMusicVolume) {
          buffer.volume = (buffer.customData.initialVolume * this.musicVolume * GameManager.settings.bgmVolume / 10000) / 100;
        }
        buffer.update();
      }
    }
    if (GameManager.settings.bgmVolume !== this.generalMusicVolume) {
      return this.generalMusicVolume = GameManager.settings.bgmVolume;
    }
  };


  /**
  * Updates all audio-buffers depending on the play-type.
  *
  * @method updateAudioBuffers
  * @protected
   */

  AudioManager.prototype.updateGeneralVolume = function() {
    var k, reference, results;
    if (GameManager.settings.seVolume !== this.generalSoundVolume || GameManager.settings.voiceVolume !== this.generalVoiceVolume) {
      this.generalSoundVolume = GameManager.settings.seVolume;
      this.generalVoiceVolume = GameManager.settings.voiceVolume;
      results = [];
      for (k in this.soundReferences) {
        results.push((function() {
          var j, len, ref, results1;
          ref = this.soundReferences[k];
          results1 = [];
          for (j = 0, len = ref.length; j < len; j++) {
            reference = ref[j];
            if (reference.voice) {
              results1.push(reference.volume = (reference.customData.initialVolume * this.voiceVolume * GameManager.settings.voiceVolume / 10000) / 100);
            } else {
              results1.push(reference.volume = (reference.customData.initialVolume * this.soundVolume * GameManager.settings.seVolume / 10000) / 100);
            }
          }
          return results1;
        }).call(this));
      }
      return results;
    }
  };


  /**
  * Updates the audio-playback.
  *
  * @method update
   */

  AudioManager.prototype.update = function() {
    this.updateAudioBuffers();
    return this.updateGeneralVolume();
  };


  /**
  * Changes the current music to the specified one.
  *
  * @method changeMusic
  * @param {Object} music - The music to play. If <b>null</b> the current music will stop playing.
   */

  AudioManager.prototype.changeMusic = function(music) {
    if ((music != null) && (music.name != null)) {
      if ((this.music != null) && this.music.name !== music.name) {
        return this.playMusic(music);
      } else if (this.music == null) {
        return this.playMusic(music);
      }
    } else {
      return this.stopMusic();
    }
  };


  /**
  * Prepares.
  *
  * @method prepare
  * @param {Object} music - The music to play. If <b>null</b> the current music will stop playing.
   */

  AudioManager.prototype.prepare = function(path, volume, rate) {
    var buffer;
    buffer = ResourceManager.getAudioBuffer(path);
    if (buffer.decoded) {
      buffer.volume = volume != null ? volume / 100 : 1.0;
      buffer.playbackRate = rate != null ? rate / 100 : 1.0;
    } else {
      buffer.onFinishDecode = (function(_this) {
        return function(source) {
          source.volume = volume != null ? volume / 100 : 1.0;
          return source.playbackRate = rate != null ? rate / 100 : 1.0;
        };
      })(this);
      buffer.decode();
    }
    return buffer;
  };


  /**
  * Plays an audio resource.
  *
  * @method play
  * @param {String} path - The path to the audio resource.
  * @param {number} volume - The volume.
  * @param {number} rate - The playback rate.
  * @param {number} fadeInTime - The fade-in time in frames.
   */

  AudioManager.prototype.play = function(path, volume, rate, fadeInTime) {
    var buffer;
    buffer = ResourceManager.getAudioStream(path);
    if (buffer.decoded) {
      buffer.volume = volume != null ? volume / 100 : 1.0;
      buffer.playbackRate = rate != null ? rate / 100 : 1.0;
      if (GameManager.settings.bgmEnabled) {
        buffer.play(fadeInTime);
      }
    } else {
      buffer.onFinishDecode = (function(_this) {
        return function(source) {
          source.volume = volume != null ? volume / 100 : 1.0;
          source.playbackRate = rate != null ? rate / 100 : 1.0;
          if (GameManager.settings.bgmEnabled) {
            return source.play(fadeInTime);
          }
        };
      })(this);
      buffer.decode();
    }
    return buffer;
  };


  /**
  * Stops all sounds.
  *
  * @method stopAllSounds
   */

  AudioManager.prototype.stopAllSounds = function() {
    var k, reference, results;
    results = [];
    for (k in this.soundReferences) {
      results.push((function() {
        var j, len, ref, results1;
        ref = this.soundReferences[k];
        results1 = [];
        for (j = 0, len = ref.length; j < len; j++) {
          reference = ref[j];
          results1.push(reference != null ? reference.stop() : void 0);
        }
        return results1;
      }).call(this));
    }
    return results;
  };


  /**
  * Stops a sound and all references of it.
  *
  * @method stopSound
  * @param {String} name - The name of the sound to stop.
   */

  AudioManager.prototype.stopSound = function(name) {
    var j, len, ref, reference, results;
    if (this.soundReferences[name] != null) {
      ref = this.soundReferences[name];
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        reference = ref[j];
        results.push(reference.stop());
      }
      return results;
    }
  };


  /**
  * Stops a voice.
  *
  * @method stopVoice
  * @param {String} name - The name of the voice to stop.
   */

  AudioManager.prototype.stopVoice = function(name) {
    return this.stopSound(name);
  };


  /**
  * Stops all voices.
  *
  * @method stopAllVoices
   */

  AudioManager.prototype.stopAllVoices = function() {
    var k, reference, results;
    results = [];
    for (k in this.soundReferences) {
      results.push((function() {
        var j, len, ref, results1;
        ref = this.soundReferences[k];
        results1 = [];
        for (j = 0, len = ref.length; j < len; j++) {
          reference = ref[j];
          if (reference.voice) {
            results1.push(reference.stop());
          } else {
            results1.push(void 0);
          }
        }
        return results1;
      }).call(this));
    }
    return results;
  };


  /**
  * Plays a voice.
  *
  * @method playVoice
  * @param {String} name - The name of the voice to play.
  * @param {number} volume - The voice volume.
  * @param {number} rate - The voice playback rate.
   */

  AudioManager.prototype.playVoice = function(name, volume, rate) {
    var ref, voice;
    voice = null;
    if (GameManager.settings.voiceEnabled && !((ref = $PARAMS.preview) != null ? ref.settings.voiceDisabled : void 0)) {
      voice = this.playSound(name, volume || GameManager.defaults.audio.voiceVolume, rate || GameManager.defaults.audio.voicePlaybackRate, false, true);
    }
    return voice;
  };


  /**
  * Plays a sound.
  *
  * @method playSound
  * @param {String} name - The name of the sound to play.
  * @param {number} volume - The sound's volume.
  * @param {number} rate - The sound's playback rate.
  * @param {boolean} musicEffect - Indicates if the sound should be played as a music effect. In that case, the current music
  * at audio-layer will be paused until the sound finishes playing.
  * @param {boolean} voice - Indicates if the sound should be handled as a voice.
   */

  AudioManager.prototype.playSound = function(name, volume, rate, musicEffect, voice, loopSound) {
    var buffer, folder, initialVolume, j, len, r, ref, ref1, ref2, reference;
    if ((ref = $PARAMS.preview) != null ? ref.settings.soundDisabled : void 0) {
      return;
    }
    if ((name == null) || (!voice && !GameManager.settings.soundEnabled)) {
      return;
    }
    folder = "Audio/Sounds";
    if (name.name != null) {
      volume = volume != null ? volume : name.volume;
      rate = rate != null ? rate : name.playbackRate;
      folder = (ref1 = name.folderPath) != null ? ref1 : folder;
      name = name.name;
    }
    if (name.length === 0) {
      return;
    }
    if (rate == null) {
      rate = 100;
    }
    if (volume == null) {
      volume = 100;
    }
    if (musicEffect) {
      this.stopMusic();
    }
    if (this.soundReferences[name] == null) {
      this.soundReferences[name] = [];
    }
    volume = volume != null ? volume : 100;
    initialVolume = volume;
    volume *= voice ? this.generalVoiceVolume / 100 : this.generalSoundVolume / 100;
    reference = null;
    ref2 = this.soundReferences[name];
    for (j = 0, len = ref2.length; j < len; j++) {
      r = ref2[j];
      if (!r.isPlaying) {
        reference = r;
        if (musicEffect) {
          reference.onEnd = (function(_this) {
            return function() {
              return _this.resumeMusic(40);
            };
          })(this);
        }
        reference.customData.initialVolume = initialVolume;
        reference.voice = voice;
        reference.volume = volume / 100;
        reference.playbackRate = rate / 100;
        reference.loop = loopSound;
        if (voice) {
          this.voice = reference;
        }
        if (voice && !reference.useAnalyser) {
          reference.useAnalyser = true;
          reference.createAnalyser();
        }
        reference.play();
        break;
      }
    }
    if (reference == null) {
      buffer = ResourceManager.getAudioBuffer(folder + "/" + name);
      if (buffer && buffer.loaded) {
        if (buffer.decoded) {
          reference = new GS.AudioBufferReference(buffer, voice);
          if (musicEffect) {
            reference.onEnd = (function(_this) {
              return function() {
                return _this.resumeMusic(40);
              };
            })(this);
          }
          reference.customData.initialVolume = initialVolume;
          reference.volume = volume / 100;
          reference.playbackRate = rate / 100;
          reference.voice = voice;
          reference.loop = loopSound;
          reference.play();
          if (voice) {
            this.voice = reference;
          }
          this.soundReferences[name].push(reference);
        } else {
          buffer.name = name;
          buffer.onDecodeFinish = (function(_this) {
            return function(source) {
              reference = new GS.AudioBufferReference(source, voice);
              if (musicEffect) {
                reference.onEnd = function() {
                  return _this.resumeMusic(40);
                };
              }
              reference.voice = voice;
              reference.customData.initialVolume = initialVolume;
              reference.volume = volume / 100;
              reference.playbackRate = rate / 100;
              reference.loop = loopSound;
              if (voice) {
                _this.voice = reference;
              }
              reference.play();
              return _this.soundReferences[source.name].push(reference);
            };
          })(this);
          buffer.decode();
        }
      }
    }
    return reference;
  };


  /**
  * Plays a music as a random music. A random music will fade-in and fade-out
  * at random times. That can be combined with other audio-layers to create a
  * much better looping of an audio track.
  *
  * @method playMusicRandom
  * @param {Object} music - The music to play.
  * @param {number} fadeTime - The time for a single fade-in/out in frames.
  * @param {number} layer - The audio layer to use.
  * @param {gs.Range} playTime - Play-Time range like 10s to 30s.
  * @param {gs.Range} playRange - Play-Range.
   */

  AudioManager.prototype.playMusicRandom = function(music, fadeTime, layer, playTime, playRange) {
    var initialVolume, musicBuffer, ref, ref1, volume;
    if ((ref = $PARAMS.preview) != null ? ref.settings.musicDisabled : void 0) {
      return;
    }
    layer = layer != null ? layer : 0;
    volume = music.volume != null ? music.volume : 100;
    initialVolume = volume;
    volume = volume * (this.generalMusicVolume / 100);
    this.disposeMusic(layer);
    if ((music.name != null) && music.name.length > 0) {
      musicBuffer = this.play(((ref1 = music.folderPath) != null ? ref1 : "Audio/Music") + "/" + music.name, volume, music.rate);
      musicBuffer.loop = true;
      musicBuffer.volume = 0;
      musicBuffer.duration = Math.round(musicBuffer.duration * 1000 / 16.6);
      musicBuffer.customData.playType = 1;
      musicBuffer.customData.playTime = playTime;
      musicBuffer.customData.initialVolume = initialVolume;
      if (playRange.end === 0) {
        musicBuffer.customData.playRange = {
          start: playRange.start,
          end: musicBuffer.duration
        };
      } else {
        musicBuffer.customData.playRange = playRange;
      }
      musicBuffer.customData.fadeTime = fadeTime;
      musicBuffer.customData.startTimer = Math.round(musicBuffer.customData.playRange.start + Math.random() * (musicBuffer.customData.playRange.end - musicBuffer.customData.playRange.start));
      if (!this.audioBuffers.contains(musicBuffer)) {
        this.audioBuffers.push(musicBuffer);
      }
      this.audioBuffersByLayer[layer] = musicBuffer;
      return this.audioLayers[layer] = {
        name: music.name,
        time: music.currentTime,
        volume: music.volume,
        rate: music.playbackRate,
        fadeInTime: fadeTime,
        customData: musicBuffer.customData
      };
    }
  };


  /**
  * Plays a music.
  *
  * @method playMusic
  * @param {string|Object} name - The music to play. Can be just a name or a music data-object.
  * @param {number} volume - The music's volume in percent.
  * @param {number} rate - The music's playback rate in percent.
  * @param {number} fadeInTime - The fade-in time.
  * @param {number} layer - The layer to play the music on.
  * @param {boolean} loop - Indicates if the music should be looped
   */

  AudioManager.prototype.playMusic = function(name, volume, rate, fadeInTime, layer, loopMusic) {
    var folder, initialVolume, musicBuffer, ref, ref1;
    if ((ref = $PARAMS.preview) != null ? ref.settings.musicDisabled : void 0) {
      return;
    }
    if (loopMusic == null) {
      loopMusic = true;
    }
    folder = "Audio/Music";
    if ((name != null) && (name.name != null)) {
      layer = layer != null ? layer : rate || 0;
      fadeInTime = volume;
      volume = volume != null ? volume : name.volume;
      rate = rate != null ? rate : name.playbackRate;
      folder = (ref1 = name.folderPath) != null ? ref1 : folder;
      name = name.name;
    } else {
      layer = layer != null ? layer : 0;
    }
    this.disposeMusic(layer);
    this.audioLayers[layer] = {
      name: name,
      volume: volume,
      rate: rate,
      fadeInTime: fadeInTime,
      playing: true
    };
    volume = volume != null ? volume : 100;
    initialVolume = volume;
    volume = volume * (this.generalMusicVolume / 100);
    if ((name != null) && name.length > 0) {
      this.music = {
        name: name
      };
      musicBuffer = this.play(folder + "/" + name, volume, rate, fadeInTime);
      musicBuffer.loop = loopMusic;
      musicBuffer.customData.initialVolume = initialVolume;
      if (!this.audioBuffers.contains(musicBuffer)) {
        this.audioBuffers.push(musicBuffer);
      }
      this.audioBuffersByLayer[layer] = musicBuffer;
    }
    return musicBuffer;
  };


  /**
  * Resumes a paused music.
  *
  * @method resumeMusic
  * @param {number} fadeInTime - The fade-in time in frames.
  * @param {number} layer - The audio layer to resume.
   */

  AudioManager.prototype.resumeMusic = function(fadeInTime, layer) {
    var ref;
    layer = layer != null ? layer : 0;
    if ((this.audioBuffersByLayer[layer] != null) && !this.audioBuffersByLayer[layer].isPlaying) {
      this.audioBuffersByLayer[layer].resume(fadeInTime);
      return (ref = this.audioLayers[layer]) != null ? ref.playing = true : void 0;
    }
  };


  /**
  * Stops a music.
  *
  * @method stopMusic
  * @param {number} fadeOutTime - The fade-out time in frames.
  * @param {number} layer - The audio layer to stop.
   */

  AudioManager.prototype.stopMusic = function(fadeOutTime, layer) {
    var ref, ref1, ref2, ref3;
    layer = layer != null ? layer : 0;
    if ((ref = this.audioBuffersByLayer[layer]) != null) {
      ref.stop(fadeOutTime);
    }
    if ((ref1 = this.audioBuffersByLayer[layer]) != null) {
      ref1.customData = {
        initialVolume: (ref2 = this.audioBuffersByLayer[layer]) != null ? ref2.customData.initialVolume : void 0
      };
    }
    if ((ref3 = this.audioLayers[layer]) != null) {
      ref3.playing = false;
    }
    return this.music = null;
  };


  /**
  * Stops all music/audio layers.
  *
  * @method stopAllMusic
  * @param {number} fadeOutTime - The fade-out time in frames.
   */

  AudioManager.prototype.stopAllMusic = function(fadeOutTime) {
    var buffer, j, len, ref;
    ref = this.audioBuffers;
    for (j = 0, len = ref.length; j < len; j++) {
      buffer = ref[j];
      if (buffer != null) {
        buffer.stop(fadeOutTime);
        buffer.customData = {
          initialVolume: buffer.initialVolume
        };
      }
    }
    return this.music = null;
  };

  AudioManager.prototype.dispose = function(context) {
    var buffer, data, j, l, layer, len, len1, ref, ref1, reference, results;
    ref = this.soundReferences;
    for (j = 0, len = ref.length; j < len; j++) {
      reference = ref[j];
      reference.dispose();
    }
    data = context.resources.select(function(r) {
      return r.data;
    });
    ref1 = this.audioBuffersByLayer;
    results = [];
    for (layer = l = 0, len1 = ref1.length; l < len1; layer = ++l) {
      buffer = ref1[layer];
      if (buffer && data.indexOf(buffer) !== -1) {
        buffer.dispose();
        this.audioBuffers.remove(buffer);
        this.audioBuffersByLayer[layer] = null;
        results.push(this.audioLayers[layer] = null);
      } else {
        results.push(void 0);
      }
    }
    return results;
  };


  /**
  * Disposes a music.
  *
  * @method disposeMusic
  * @param {number} layer - The audio layer of the music to dispose.
   */

  AudioManager.prototype.disposeMusic = function(layer) {
    layer = layer != null ? layer : 0;
    this.stopMusic(0, layer);
    this.audioBuffers.remove(this.audioBuffersByLayer[layer]);
    this.audioBuffersByLayer[layer] = null;
    return this.audioLayers[layer] = null;
  };

  return AudioManager;

})();

window.AudioManager = new AudioManager();

gs.AudioManager = AudioManager;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUE7O0FBQU07O0FBQ0Y7Ozs7Ozs7O0VBUWEsc0JBQUE7O0FBQ1Q7Ozs7OztJQU1BLElBQUMsQ0FBQSxZQUFELEdBQWdCOztBQUVoQjs7Ozs7O0lBTUEsSUFBQyxDQUFBLG1CQUFELEdBQXVCOztBQUV2Qjs7Ozs7O0lBTUEsSUFBQyxDQUFBLGVBQUQsR0FBbUI7O0FBRW5COzs7Ozs7SUFNQSxJQUFDLENBQUEsS0FBRCxHQUFTOztBQUVUOzs7Ozs7SUFNQSxJQUFDLENBQUEsV0FBRCxHQUFlOztBQUVmOzs7Ozs7SUFNQSxJQUFDLENBQUEsV0FBRCxHQUFlOztBQUVmOzs7Ozs7SUFNQSxJQUFDLENBQUEsV0FBRCxHQUFlOztBQUVmOzs7Ozs7SUFNQSxJQUFDLENBQUEsa0JBQUQsR0FBc0I7O0FBRXRCOzs7Ozs7SUFNQSxJQUFDLENBQUEsa0JBQUQsR0FBc0I7O0FBRXRCOzs7Ozs7SUFNQSxJQUFDLENBQUEsa0JBQUQsR0FBc0I7O0FBRXRCOzs7Ozs7SUFNQSxJQUFDLENBQUEsV0FBRCxHQUFlO0VBdkZOOzs7QUF5RmI7Ozs7Ozs7eUJBTUEsT0FBQSxHQUFTLFNBQUMsTUFBRDtBQUNMLFFBQUE7SUFBQSxJQUFDLENBQUEsV0FBRCxHQUFlO0FBRWY7U0FBQSxnREFBQTs7TUFDSSxJQUFHLEtBQUEsSUFBVSxLQUFLLENBQUMsT0FBbkI7UUFDSSxJQUFHLEtBQUssQ0FBQyxVQUFUO3VCQUNJLElBQUMsQ0FBQSxlQUFELENBQWlCLEtBQWpCLEVBQXdCLEtBQUssQ0FBQyxVQUFVLENBQUMsUUFBekMsRUFBbUQsQ0FBbkQsRUFBc0QsS0FBSyxDQUFDLFVBQVUsQ0FBQyxRQUF2RSxFQUFpRixLQUFLLENBQUMsVUFBVSxDQUFDLFNBQWxHLEdBREo7U0FBQSxNQUFBO3VCQUdJLElBQUMsQ0FBQSxTQUFELENBQVcsS0FBWCxFQUFrQixLQUFLLENBQUMsVUFBeEIsRUFBb0MsQ0FBcEMsR0FISjtTQURKO09BQUEsTUFBQTs2QkFBQTs7QUFESjs7RUFISzs7O0FBVVQ7Ozs7Ozs7eUJBTUEsU0FBQSxHQUFXLFNBQUMsSUFBRDtBQUNQLFFBQUE7SUFBQSxJQUFHLFlBQUg7TUFDSSxNQUFBLDJDQUEyQjtNQUMzQixJQUFBLEdBQVEsSUFBSSxDQUFDLElBQUwsSUFBYSxLQUZ6Qjs7SUFHQSxJQUFHLElBQUEsSUFBUyxJQUFJLENBQUMsTUFBTCxHQUFjLENBQTFCO2FBQ0ksZUFBZSxDQUFDLGNBQWhCLENBQWtDLE1BQUQsR0FBUSxHQUFSLEdBQVcsSUFBNUMsRUFESjs7RUFKTzs7O0FBT1g7Ozs7Ozs7eUJBTUEsU0FBQSxHQUFXLFNBQUMsSUFBRDtBQUNQLFFBQUE7SUFBQSxJQUFHLFlBQUg7TUFDSSxNQUFBLDJDQUEyQjtNQUMzQixJQUFBLEdBQU8sSUFBSSxDQUFDLElBQUwsSUFBYSxLQUZ4Qjs7SUFHQSxJQUFHLElBQUEsSUFBUyxJQUFJLENBQUMsTUFBTCxHQUFjLENBQTFCO2FBQ0ksZUFBZSxDQUFDLGNBQWhCLENBQWtDLE1BQUQsR0FBUSxHQUFSLEdBQVcsSUFBNUMsRUFESjs7RUFKTzs7O0FBT1g7Ozs7Ozs7O3lCQVFBLGlCQUFBLEdBQW1CLFNBQUMsTUFBRDtBQUNmLFFBQUE7SUFBQSxJQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsVUFBbEIsR0FBK0IsQ0FBbEM7TUFDSSxNQUFNLENBQUMsVUFBVSxDQUFDLFVBQWxCO01BQ0EsSUFBRyxNQUFNLENBQUMsVUFBVSxDQUFDLFVBQWxCLElBQWdDLENBQW5DO1FBQ0ksTUFBTSxDQUFDLFlBQVAsR0FBc0IsR0FBQSxHQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFsQixJQUE0QixDQUE3QjtRQUM1QixNQUFNLENBQUMsVUFBUCxHQUFvQixNQUFNLENBQUMsVUFBVSxDQUFDLFFBQWxCLElBQTRCO1FBQ2hELE1BQU0sQ0FBQyxXQUFQLEdBQXFCLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBbEIsSUFBNEI7UUFDakQsTUFBTSxDQUFDLFFBQVAsR0FBa0IsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsR0FBM0IsR0FBaUMsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFBLEdBQWdCLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsR0FBM0IsR0FBaUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsR0FBN0Q7UUFDbkUsV0FBQSxHQUFjLE1BQU0sQ0FBQztRQUNyQixRQUFBLEdBQVcsTUFBTSxDQUFDLFFBQVAsR0FBa0I7UUFDN0IsTUFBTSxDQUFDLFFBQVAsR0FBa0IsSUFBSSxDQUFDLEdBQUwsQ0FBUyxRQUFBLEdBQVcsSUFBWCxHQUFrQixJQUEzQixFQUFpQyxNQUFNLENBQUMsUUFBeEM7ZUFFbEIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxVQUFsQixHQUErQixNQUFNLENBQUMsUUFBUCxHQUFrQixNQUFNLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxLQUE5QyxHQUFzRCxJQUFJLENBQUMsTUFBTCxDQUFBLENBQUEsR0FBZ0IsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxHQUE1QixHQUFrQyxNQUFNLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxLQUEvRCxFQVR6RztPQUZKOztFQURlOzs7QUFjbkI7Ozs7Ozs7eUJBTUEsa0JBQUEsR0FBb0IsU0FBQTtBQUNoQixRQUFBO0FBQUE7QUFBQSxTQUFBLHFDQUFBOztNQUNJLElBQUcsY0FBSDtRQUNJLElBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFsQixLQUE4QixDQUFqQztVQUNJLElBQUMsQ0FBQSxpQkFBRCxDQUFtQixNQUFuQixFQURKOztRQUdBLElBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyxTQUFyQixLQUFrQyxJQUFDLENBQUEsa0JBQXRDO1VBQ0ksTUFBTSxDQUFDLE1BQVAsR0FBZ0IsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLGFBQWxCLEdBQWtDLElBQUMsQ0FBQSxXQUFuQyxHQUFpRCxXQUFXLENBQUMsUUFBUSxDQUFDLFNBQXRFLEdBQWtGLEtBQW5GLENBQUEsR0FBNEYsSUFEaEg7O1FBR0EsTUFBTSxDQUFDLE1BQVAsQ0FBQSxFQVBKOztBQURKO0lBU0EsSUFBRyxXQUFXLENBQUMsUUFBUSxDQUFDLFNBQXJCLEtBQWtDLElBQUMsQ0FBQSxrQkFBdEM7YUFDSSxJQUFDLENBQUEsa0JBQUQsR0FBc0IsV0FBVyxDQUFDLFFBQVEsQ0FBQyxVQUQvQzs7RUFWZ0I7OztBQWNwQjs7Ozs7Ozt5QkFNQSxtQkFBQSxHQUFxQixTQUFBO0FBQ2pCLFFBQUE7SUFBQSxJQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsUUFBckIsS0FBaUMsSUFBQyxDQUFBLGtCQUFsQyxJQUF3RCxXQUFXLENBQUMsUUFBUSxDQUFDLFdBQXJCLEtBQW9DLElBQUMsQ0FBQSxrQkFBaEc7TUFDSSxJQUFDLENBQUEsa0JBQUQsR0FBc0IsV0FBVyxDQUFDLFFBQVEsQ0FBQztNQUMzQyxJQUFDLENBQUEsa0JBQUQsR0FBc0IsV0FBVyxDQUFDLFFBQVEsQ0FBQztBQUMzQztXQUFBLHlCQUFBOzs7QUFDSTtBQUFBO2VBQUEscUNBQUE7O1lBQ0ksSUFBRyxTQUFTLENBQUMsS0FBYjs0QkFDSSxTQUFTLENBQUMsTUFBVixHQUFtQixDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsYUFBckIsR0FBcUMsSUFBQyxDQUFBLFdBQXRDLEdBQW9ELFdBQVcsQ0FBQyxRQUFRLENBQUMsV0FBekUsR0FBdUYsS0FBeEYsQ0FBQSxHQUFpRyxLQUR4SDthQUFBLE1BQUE7NEJBR0ksU0FBUyxDQUFDLE1BQVYsR0FBbUIsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLGFBQXJCLEdBQXFDLElBQUMsQ0FBQSxXQUF0QyxHQUFvRCxXQUFXLENBQUMsUUFBUSxDQUFDLFFBQXpFLEdBQW9GLEtBQXJGLENBQUEsR0FBOEYsS0FIckg7O0FBREo7OztBQURKO3FCQUhKOztFQURpQjs7O0FBVXJCOzs7Ozs7eUJBS0EsTUFBQSxHQUFRLFNBQUE7SUFDSixJQUFDLENBQUEsa0JBQUQsQ0FBQTtXQUNBLElBQUMsQ0FBQSxtQkFBRCxDQUFBO0VBRkk7OztBQUlSOzs7Ozs7O3lCQU1BLFdBQUEsR0FBYSxTQUFDLEtBQUQ7SUFDVCxJQUFHLGVBQUEsSUFBVyxvQkFBZDtNQUNJLElBQUcsb0JBQUEsSUFBWSxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsS0FBZSxLQUFLLENBQUMsSUFBcEM7ZUFDSSxJQUFDLENBQUEsU0FBRCxDQUFXLEtBQVgsRUFESjtPQUFBLE1BRUssSUFBTyxrQkFBUDtlQUNELElBQUMsQ0FBQSxTQUFELENBQVcsS0FBWCxFQURDO09BSFQ7S0FBQSxNQUFBO2FBTUksSUFBQyxDQUFBLFNBQUQsQ0FBQSxFQU5KOztFQURTOzs7QUFVYjs7Ozs7Ozt5QkFNQSxPQUFBLEdBQVMsU0FBQyxJQUFELEVBQU8sTUFBUCxFQUFlLElBQWY7QUFDTCxRQUFBO0lBQUEsTUFBQSxHQUFTLGVBQWUsQ0FBQyxjQUFoQixDQUErQixJQUEvQjtJQUVULElBQUcsTUFBTSxDQUFDLE9BQVY7TUFDSSxNQUFNLENBQUMsTUFBUCxHQUFtQixjQUFILEdBQWdCLE1BQUEsR0FBUyxHQUF6QixHQUFrQztNQUNsRCxNQUFNLENBQUMsWUFBUCxHQUF5QixZQUFILEdBQWMsSUFBQSxHQUFPLEdBQXJCLEdBQThCLElBRnhEO0tBQUEsTUFBQTtNQUlHLE1BQU0sQ0FBQyxjQUFQLEdBQXdCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxNQUFEO1VBQ3BCLE1BQU0sQ0FBQyxNQUFQLEdBQW1CLGNBQUgsR0FBZ0IsTUFBQSxHQUFTLEdBQXpCLEdBQWtDO2lCQUNsRCxNQUFNLENBQUMsWUFBUCxHQUF5QixZQUFILEdBQWMsSUFBQSxHQUFPLEdBQXJCLEdBQThCO1FBRmhDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtNQUd4QixNQUFNLENBQUMsTUFBUCxDQUFBLEVBUEg7O0FBU0EsV0FBTztFQVpGOzs7QUFjVDs7Ozs7Ozs7Ozt5QkFTQSxJQUFBLEdBQU0sU0FBQyxJQUFELEVBQU8sTUFBUCxFQUFlLElBQWYsRUFBcUIsVUFBckI7QUFDRixRQUFBO0lBQUEsTUFBQSxHQUFTLGVBQWUsQ0FBQyxjQUFoQixDQUErQixJQUEvQjtJQUVULElBQUcsTUFBTSxDQUFDLE9BQVY7TUFDSSxNQUFNLENBQUMsTUFBUCxHQUFtQixjQUFILEdBQWdCLE1BQUEsR0FBUyxHQUF6QixHQUFrQztNQUNsRCxNQUFNLENBQUMsWUFBUCxHQUF5QixZQUFILEdBQWMsSUFBQSxHQUFPLEdBQXJCLEdBQThCO01BQ3BELElBQTJCLFdBQVcsQ0FBQyxRQUFRLENBQUMsVUFBaEQ7UUFBQSxNQUFNLENBQUMsSUFBUCxDQUFZLFVBQVosRUFBQTtPQUhKO0tBQUEsTUFBQTtNQUtHLE1BQU0sQ0FBQyxjQUFQLEdBQXdCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxNQUFEO1VBQ3BCLE1BQU0sQ0FBQyxNQUFQLEdBQW1CLGNBQUgsR0FBZ0IsTUFBQSxHQUFTLEdBQXpCLEdBQWtDO1VBQ2xELE1BQU0sQ0FBQyxZQUFQLEdBQXlCLFlBQUgsR0FBYyxJQUFBLEdBQU8sR0FBckIsR0FBOEI7VUFDcEQsSUFBMkIsV0FBVyxDQUFDLFFBQVEsQ0FBQyxVQUFoRDttQkFBQSxNQUFNLENBQUMsSUFBUCxDQUFZLFVBQVosRUFBQTs7UUFIb0I7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO01BSXhCLE1BQU0sQ0FBQyxNQUFQLENBQUEsRUFUSDs7QUFXQSxXQUFPO0VBZEw7OztBQWdCTjs7Ozs7O3lCQUtBLGFBQUEsR0FBZSxTQUFBO0FBQ1gsUUFBQTtBQUFBO1NBQUEseUJBQUE7OztBQUNJO0FBQUE7YUFBQSxxQ0FBQTs7NENBQ0ksU0FBUyxDQUFFLElBQVgsQ0FBQTtBQURKOzs7QUFESjs7RUFEVzs7O0FBS2Y7Ozs7Ozs7eUJBTUEsU0FBQSxHQUFXLFNBQUMsSUFBRDtBQUNQLFFBQUE7SUFBQSxJQUFHLGtDQUFIO0FBQ0k7QUFBQTtXQUFBLHFDQUFBOztxQkFDSSxTQUFTLENBQUMsSUFBVixDQUFBO0FBREo7cUJBREo7O0VBRE87OztBQU1YOzs7Ozs7O3lCQU1BLFNBQUEsR0FBVyxTQUFDLElBQUQ7V0FDUCxJQUFDLENBQUEsU0FBRCxDQUFXLElBQVg7RUFETzs7O0FBR1g7Ozs7Ozt5QkFLQSxhQUFBLEdBQWUsU0FBQTtBQUNYLFFBQUE7QUFBQTtTQUFBLHlCQUFBOzs7QUFDSTtBQUFBO2FBQUEscUNBQUE7O1VBQ0ksSUFBb0IsU0FBUyxDQUFDLEtBQTlCOzBCQUFBLFNBQVMsQ0FBQyxJQUFWLENBQUEsR0FBQTtXQUFBLE1BQUE7a0NBQUE7O0FBREo7OztBQURKOztFQURXOzs7QUFLZjs7Ozs7Ozs7O3lCQVFBLFNBQUEsR0FBVyxTQUFDLElBQUQsRUFBTyxNQUFQLEVBQWUsSUFBZjtBQUNQLFFBQUE7SUFBQSxLQUFBLEdBQVE7SUFDUixJQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsWUFBckIsSUFBc0MsdUNBQW1CLENBQUUsUUFBUSxDQUFDLHVCQUF2RTtNQUNJLEtBQUEsR0FBUSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQVgsRUFBaUIsTUFBQSxJQUFVLFdBQVcsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFdBQXRELEVBQW1FLElBQUEsSUFBUSxXQUFXLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxpQkFBdEcsRUFBeUgsS0FBekgsRUFBNkgsSUFBN0gsRUFEWjs7QUFHQSxXQUFPO0VBTEE7OztBQU9YOzs7Ozs7Ozs7Ozs7eUJBV0EsU0FBQSxHQUFXLFNBQUMsSUFBRCxFQUFPLE1BQVAsRUFBZSxJQUFmLEVBQXFCLFdBQXJCLEVBQWtDLEtBQWxDLEVBQXlDLFNBQXpDO0FBQ1AsUUFBQTtJQUFBLHlDQUFrQixDQUFFLFFBQVEsQ0FBQyxzQkFBN0I7QUFBZ0QsYUFBaEQ7O0lBQ0EsSUFBTyxjQUFKLElBQWEsQ0FBQyxDQUFDLEtBQUQsSUFBVyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsWUFBbEMsQ0FBaEI7QUFBcUUsYUFBckU7O0lBQ0EsTUFBQSxHQUFTO0lBQ1QsSUFBRyxpQkFBSDtNQUNJLE1BQUEsb0JBQVMsU0FBUyxJQUFJLENBQUM7TUFDdkIsSUFBQSxrQkFBTyxPQUFPLElBQUksQ0FBQztNQUNuQixNQUFBLDZDQUEyQjtNQUMzQixJQUFBLEdBQU8sSUFBSSxDQUFDLEtBSmhCOztJQU1BLElBQUcsSUFBSSxDQUFDLE1BQUwsS0FBZSxDQUFsQjtBQUF5QixhQUF6Qjs7O01BRUEsT0FBUTs7O01BQ1IsU0FBVTs7SUFFVixJQUFHLFdBQUg7TUFDSSxJQUFDLENBQUEsU0FBRCxDQUFBLEVBREo7O0lBR0EsSUFBTyxrQ0FBUDtNQUNJLElBQUMsQ0FBQSxlQUFnQixDQUFBLElBQUEsQ0FBakIsR0FBeUIsR0FEN0I7O0lBR0EsTUFBQSxvQkFBUyxTQUFTO0lBQ2xCLGFBQUEsR0FBZ0I7SUFDaEIsTUFBQSxJQUFhLEtBQUgsR0FBYyxJQUFDLENBQUEsa0JBQUQsR0FBc0IsR0FBcEMsR0FBNkMsSUFBQyxDQUFBLGtCQUFELEdBQXNCO0lBRTdFLFNBQUEsR0FBWTtBQUNaO0FBQUEsU0FBQSxzQ0FBQTs7TUFDSSxJQUFHLENBQUksQ0FBQyxDQUFDLFNBQVQ7UUFDSSxTQUFBLEdBQVk7UUFDWixJQUFHLFdBQUg7VUFBb0IsU0FBUyxDQUFDLEtBQVYsR0FBa0IsQ0FBQSxTQUFBLEtBQUE7bUJBQUEsU0FBQTtxQkFBRyxLQUFDLENBQUEsV0FBRCxDQUFhLEVBQWI7WUFBSDtVQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsRUFBdEM7O1FBQ0EsU0FBUyxDQUFDLFVBQVUsQ0FBQyxhQUFyQixHQUFxQztRQUNyQyxTQUFTLENBQUMsS0FBVixHQUFrQjtRQUNsQixTQUFTLENBQUMsTUFBVixHQUFtQixNQUFBLEdBQVM7UUFDNUIsU0FBUyxDQUFDLFlBQVYsR0FBeUIsSUFBQSxHQUFPO1FBQ2hDLFNBQVMsQ0FBQyxJQUFWLEdBQWlCO1FBQ2pCLElBQXNCLEtBQXRCO1VBQUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxVQUFUOztRQUNBLElBQUcsS0FBQSxJQUFVLENBQUMsU0FBUyxDQUFDLFdBQXhCO1VBQ0ksU0FBUyxDQUFDLFdBQVYsR0FBd0I7VUFDeEIsU0FBUyxDQUFDLGNBQVYsQ0FBQSxFQUZKOztRQUdBLFNBQVMsQ0FBQyxJQUFWLENBQUE7QUFDQSxjQWJKOztBQURKO0lBZ0JBLElBQU8saUJBQVA7TUFDSSxNQUFBLEdBQVMsZUFBZSxDQUFDLGNBQWhCLENBQWtDLE1BQUQsR0FBUSxHQUFSLEdBQVcsSUFBNUM7TUFDVCxJQUFHLE1BQUEsSUFBVyxNQUFNLENBQUMsTUFBckI7UUFDSSxJQUFHLE1BQU0sQ0FBQyxPQUFWO1VBQ0ksU0FBQSxHQUFnQixJQUFBLEVBQUUsQ0FBQyxvQkFBSCxDQUF3QixNQUF4QixFQUFnQyxLQUFoQztVQUNoQixJQUFHLFdBQUg7WUFBb0IsU0FBUyxDQUFDLEtBQVYsR0FBa0IsQ0FBQSxTQUFBLEtBQUE7cUJBQUEsU0FBQTt1QkFBRyxLQUFDLENBQUEsV0FBRCxDQUFhLEVBQWI7Y0FBSDtZQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsRUFBdEM7O1VBQ0EsU0FBUyxDQUFDLFVBQVUsQ0FBQyxhQUFyQixHQUFxQztVQUNyQyxTQUFTLENBQUMsTUFBVixHQUFtQixNQUFBLEdBQVM7VUFDNUIsU0FBUyxDQUFDLFlBQVYsR0FBeUIsSUFBQSxHQUFPO1VBQ2hDLFNBQVMsQ0FBQyxLQUFWLEdBQWtCO1VBQ2xCLFNBQVMsQ0FBQyxJQUFWLEdBQWlCO1VBQ2pCLFNBQVMsQ0FBQyxJQUFWLENBQUE7VUFDQSxJQUFzQixLQUF0QjtZQUFBLElBQUMsQ0FBQSxLQUFELEdBQVMsVUFBVDs7VUFDQSxJQUFDLENBQUEsZUFBZ0IsQ0FBQSxJQUFBLENBQUssQ0FBQyxJQUF2QixDQUE0QixTQUE1QixFQVZKO1NBQUEsTUFBQTtVQVlJLE1BQU0sQ0FBQyxJQUFQLEdBQWM7VUFDZCxNQUFNLENBQUMsY0FBUCxHQUF3QixDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFDLE1BQUQ7Y0FDcEIsU0FBQSxHQUFnQixJQUFBLEVBQUUsQ0FBQyxvQkFBSCxDQUF3QixNQUF4QixFQUFnQyxLQUFoQztjQUNoQixJQUFHLFdBQUg7Z0JBQW9CLFNBQVMsQ0FBQyxLQUFWLEdBQWtCLFNBQUE7eUJBQUcsS0FBQyxDQUFBLFdBQUQsQ0FBYSxFQUFiO2dCQUFILEVBQXRDOztjQUNBLFNBQVMsQ0FBQyxLQUFWLEdBQWtCO2NBQ2xCLFNBQVMsQ0FBQyxVQUFVLENBQUMsYUFBckIsR0FBcUM7Y0FDckMsU0FBUyxDQUFDLE1BQVYsR0FBbUIsTUFBQSxHQUFTO2NBQzVCLFNBQVMsQ0FBQyxZQUFWLEdBQXlCLElBQUEsR0FBTztjQUNoQyxTQUFTLENBQUMsSUFBVixHQUFpQjtjQUNqQixJQUFzQixLQUF0QjtnQkFBQSxLQUFDLENBQUEsS0FBRCxHQUFTLFVBQVQ7O2NBQ0EsU0FBUyxDQUFDLElBQVYsQ0FBQTtxQkFDQSxLQUFDLENBQUEsZUFBZ0IsQ0FBQSxNQUFNLENBQUMsSUFBUCxDQUFZLENBQUMsSUFBOUIsQ0FBbUMsU0FBbkM7WUFWb0I7VUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO1VBV3hCLE1BQU0sQ0FBQyxNQUFQLENBQUEsRUF4Qko7U0FESjtPQUZKOztBQTZCQSxXQUFPO0VBdkVBOzs7QUF5RVg7Ozs7Ozs7Ozs7Ozs7eUJBWUEsZUFBQSxHQUFpQixTQUFDLEtBQUQsRUFBUSxRQUFSLEVBQWtCLEtBQWxCLEVBQXlCLFFBQXpCLEVBQW1DLFNBQW5DO0FBQ2IsUUFBQTtJQUFBLHlDQUF5QixDQUFFLFFBQVEsQ0FBQyxzQkFBcEM7QUFBQSxhQUFBOztJQUNBLEtBQUEsbUJBQVEsUUFBUTtJQUVoQixNQUFBLEdBQVksb0JBQUgsR0FBc0IsS0FBSyxDQUFDLE1BQTVCLEdBQXdDO0lBQ2pELGFBQUEsR0FBZ0I7SUFDaEIsTUFBQSxHQUFTLE1BQUEsR0FBUyxDQUFDLElBQUMsQ0FBQSxrQkFBRCxHQUFzQixHQUF2QjtJQUNsQixJQUFDLENBQUEsWUFBRCxDQUFjLEtBQWQ7SUFFQSxJQUFHLG9CQUFBLElBQWdCLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBWCxHQUFvQixDQUF2QztNQUNJLFdBQUEsR0FBYyxJQUFDLENBQUEsSUFBRCxDQUFRLDRDQUFvQixhQUFwQixDQUFBLEdBQWtDLEdBQWxDLEdBQXFDLEtBQUssQ0FBQyxJQUFuRCxFQUEyRCxNQUEzRCxFQUFtRSxLQUFLLENBQUMsSUFBekU7TUFDZCxXQUFXLENBQUMsSUFBWixHQUFtQjtNQUNuQixXQUFXLENBQUMsTUFBWixHQUFxQjtNQUNyQixXQUFXLENBQUMsUUFBWixHQUF1QixJQUFJLENBQUMsS0FBTCxDQUFXLFdBQVcsQ0FBQyxRQUFaLEdBQXVCLElBQXZCLEdBQThCLElBQXpDO01BQ3ZCLFdBQVcsQ0FBQyxVQUFVLENBQUMsUUFBdkIsR0FBa0M7TUFDbEMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxRQUF2QixHQUFrQztNQUNsQyxXQUFXLENBQUMsVUFBVSxDQUFDLGFBQXZCLEdBQXVDO01BQ3ZDLElBQUcsU0FBUyxDQUFDLEdBQVYsS0FBaUIsQ0FBcEI7UUFDSSxXQUFXLENBQUMsVUFBVSxDQUFDLFNBQXZCLEdBQW1DO1VBQUUsS0FBQSxFQUFPLFNBQVMsQ0FBQyxLQUFuQjtVQUEwQixHQUFBLEVBQUssV0FBVyxDQUFDLFFBQTNDO1VBRHZDO09BQUEsTUFBQTtRQUdJLFdBQVcsQ0FBQyxVQUFVLENBQUMsU0FBdkIsR0FBbUMsVUFIdkM7O01BSUEsV0FBVyxDQUFDLFVBQVUsQ0FBQyxRQUF2QixHQUFrQztNQUVsQyxXQUFXLENBQUMsVUFBVSxDQUFDLFVBQXZCLEdBQW9DLElBQUksQ0FBQyxLQUFMLENBQVcsV0FBVyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsS0FBakMsR0FBeUMsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFBLEdBQWdCLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBakMsR0FBdUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsS0FBekUsQ0FBcEU7TUFFcEMsSUFBbUMsQ0FBSSxJQUFDLENBQUEsWUFBWSxDQUFDLFFBQWQsQ0FBdUIsV0FBdkIsQ0FBdkM7UUFBQSxJQUFDLENBQUEsWUFBWSxDQUFDLElBQWQsQ0FBbUIsV0FBbkIsRUFBQTs7TUFDQSxJQUFDLENBQUEsbUJBQW9CLENBQUEsS0FBQSxDQUFyQixHQUE4QjthQUM5QixJQUFDLENBQUEsV0FBWSxDQUFBLEtBQUEsQ0FBYixHQUFzQjtRQUFBLElBQUEsRUFBTSxLQUFLLENBQUMsSUFBWjtRQUFrQixJQUFBLEVBQU0sS0FBSyxDQUFDLFdBQTlCO1FBQTJDLE1BQUEsRUFBUSxLQUFLLENBQUMsTUFBekQ7UUFBaUUsSUFBQSxFQUFNLEtBQUssQ0FBQyxZQUE3RTtRQUEyRixVQUFBLEVBQVksUUFBdkc7UUFBaUgsVUFBQSxFQUFZLFdBQVcsQ0FBQyxVQUF6STtRQWxCMUI7O0VBVGE7OztBQTZCakI7Ozs7Ozs7Ozs7Ozt5QkFXQSxTQUFBLEdBQVcsU0FBQyxJQUFELEVBQU8sTUFBUCxFQUFlLElBQWYsRUFBcUIsVUFBckIsRUFBaUMsS0FBakMsRUFBd0MsU0FBeEM7QUFDUCxRQUFBO0lBQUEseUNBQXlCLENBQUUsUUFBUSxDQUFDLHNCQUFwQztBQUFBLGFBQUE7OztNQUNBLFlBQWE7O0lBQ2IsTUFBQSxHQUFTO0lBQ1QsSUFBRyxjQUFBLElBQVUsbUJBQWI7TUFDSSxLQUFBLEdBQVcsYUFBSCxHQUFlLEtBQWYsR0FBMEIsSUFBQSxJQUFRO01BQzFDLFVBQUEsR0FBYTtNQUNiLE1BQUEsb0JBQVMsU0FBUyxJQUFJLENBQUM7TUFDdkIsSUFBQSxrQkFBTyxPQUFPLElBQUksQ0FBQztNQUNuQixNQUFBLDZDQUEyQjtNQUMzQixJQUFBLEdBQU8sSUFBSSxDQUFDLEtBTmhCO0tBQUEsTUFBQTtNQVFJLEtBQUEsbUJBQVEsUUFBUSxFQVJwQjs7SUFVQSxJQUFDLENBQUEsWUFBRCxDQUFjLEtBQWQ7SUFDQSxJQUFDLENBQUEsV0FBWSxDQUFBLEtBQUEsQ0FBYixHQUFzQjtNQUFBLElBQUEsRUFBTSxJQUFOO01BQVksTUFBQSxFQUFRLE1BQXBCO01BQTRCLElBQUEsRUFBTSxJQUFsQztNQUF3QyxVQUFBLEVBQVksVUFBcEQ7TUFBZ0UsT0FBQSxFQUFTLElBQXpFOztJQUV0QixNQUFBLEdBQVksY0FBSCxHQUFnQixNQUFoQixHQUE0QjtJQUNyQyxhQUFBLEdBQWdCO0lBQ2hCLE1BQUEsR0FBUyxNQUFBLEdBQVMsQ0FBQyxJQUFDLENBQUEsa0JBQUQsR0FBc0IsR0FBdkI7SUFJbEIsSUFBRyxjQUFBLElBQVUsSUFBSSxDQUFDLE1BQUwsR0FBYyxDQUEzQjtNQUNJLElBQUMsQ0FBQSxLQUFELEdBQVM7UUFBQSxJQUFBLEVBQU0sSUFBTjs7TUFDVCxXQUFBLEdBQWMsSUFBQyxDQUFBLElBQUQsQ0FBUyxNQUFELEdBQVEsR0FBUixHQUFXLElBQW5CLEVBQTJCLE1BQTNCLEVBQW1DLElBQW5DLEVBQXlDLFVBQXpDO01BQ2QsV0FBVyxDQUFDLElBQVosR0FBbUI7TUFDbkIsV0FBVyxDQUFDLFVBQVUsQ0FBQyxhQUF2QixHQUF1QztNQUN2QyxJQUFtQyxDQUFJLElBQUMsQ0FBQSxZQUFZLENBQUMsUUFBZCxDQUF1QixXQUF2QixDQUF2QztRQUFBLElBQUMsQ0FBQSxZQUFZLENBQUMsSUFBZCxDQUFtQixXQUFuQixFQUFBOztNQUNBLElBQUMsQ0FBQSxtQkFBb0IsQ0FBQSxLQUFBLENBQXJCLEdBQThCLFlBTmxDOztBQVFBLFdBQU87RUEvQkE7OztBQWlDWDs7Ozs7Ozs7eUJBT0EsV0FBQSxHQUFhLFNBQUMsVUFBRCxFQUFhLEtBQWI7QUFDVCxRQUFBO0lBQUEsS0FBQSxtQkFBUSxRQUFRO0lBQ2hCLElBQUcseUNBQUEsSUFBaUMsQ0FBSSxJQUFDLENBQUEsbUJBQW9CLENBQUEsS0FBQSxDQUFNLENBQUMsU0FBcEU7TUFDSSxJQUFDLENBQUEsbUJBQW9CLENBQUEsS0FBQSxDQUFNLENBQUMsTUFBNUIsQ0FBbUMsVUFBbkM7MERBQ21CLENBQUUsT0FBckIsR0FBK0IsY0FGbkM7O0VBRlM7OztBQU1iOzs7Ozs7Ozt5QkFPQSxTQUFBLEdBQVcsU0FBQyxXQUFELEVBQWMsS0FBZDtBQUNQLFFBQUE7SUFBQSxLQUFBLG1CQUFRLFFBQVE7O1NBQ1csQ0FBRSxJQUE3QixDQUFrQyxXQUFsQzs7O1VBQzJCLENBQUUsVUFBN0IsR0FBMEM7UUFBRSxhQUFBLHlEQUEwQyxDQUFFLFVBQVUsQ0FBQyxzQkFBekQ7Ozs7VUFDdkIsQ0FBRSxPQUFyQixHQUErQjs7V0FDL0IsSUFBQyxDQUFBLEtBQUQsR0FBUztFQUxGOzs7QUFPWDs7Ozs7Ozt5QkFNQSxZQUFBLEdBQWMsU0FBQyxXQUFEO0FBQ1YsUUFBQTtBQUFBO0FBQUEsU0FBQSxxQ0FBQTs7TUFDSSxJQUFHLGNBQUg7UUFDSSxNQUFNLENBQUMsSUFBUCxDQUFZLFdBQVo7UUFDQSxNQUFNLENBQUMsVUFBUCxHQUFvQjtVQUFFLGFBQUEsRUFBZSxNQUFNLENBQUMsYUFBeEI7VUFGeEI7O0FBREo7V0FJQSxJQUFDLENBQUEsS0FBRCxHQUFTO0VBTEM7O3lCQVFkLE9BQUEsR0FBUyxTQUFDLE9BQUQ7QUFDTCxRQUFBO0FBQUE7QUFBQSxTQUFBLHFDQUFBOztNQUNJLFNBQVMsQ0FBQyxPQUFWLENBQUE7QUFESjtJQUVBLElBQUEsR0FBTyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQWxCLENBQXlCLFNBQUMsQ0FBRDthQUFPLENBQUMsQ0FBQztJQUFULENBQXpCO0FBQ1A7QUFBQTtTQUFBLHdEQUFBOztNQUNJLElBQUcsTUFBQSxJQUFXLElBQUksQ0FBQyxPQUFMLENBQWEsTUFBYixDQUFBLEtBQXdCLENBQUMsQ0FBdkM7UUFDSSxNQUFNLENBQUMsT0FBUCxDQUFBO1FBRUEsSUFBQyxDQUFBLFlBQVksQ0FBQyxNQUFkLENBQXFCLE1BQXJCO1FBQ0EsSUFBQyxDQUFBLG1CQUFvQixDQUFBLEtBQUEsQ0FBckIsR0FBOEI7cUJBQzlCLElBQUMsQ0FBQSxXQUFZLENBQUEsS0FBQSxDQUFiLEdBQXNCLE1BTDFCO09BQUEsTUFBQTs2QkFBQTs7QUFESjs7RUFKSzs7O0FBWVQ7Ozs7Ozs7eUJBTUEsWUFBQSxHQUFjLFNBQUMsS0FBRDtJQUNWLEtBQUEsbUJBQVEsUUFBUTtJQUVoQixJQUFDLENBQUEsU0FBRCxDQUFXLENBQVgsRUFBYyxLQUFkO0lBRUEsSUFBQyxDQUFBLFlBQVksQ0FBQyxNQUFkLENBQXFCLElBQUMsQ0FBQSxtQkFBb0IsQ0FBQSxLQUFBLENBQTFDO0lBQ0EsSUFBQyxDQUFBLG1CQUFvQixDQUFBLEtBQUEsQ0FBckIsR0FBOEI7V0FDOUIsSUFBQyxDQUFBLFdBQVksQ0FBQSxLQUFBLENBQWIsR0FBc0I7RUFQWjs7Ozs7O0FBU2xCLE1BQU0sQ0FBQyxZQUFQLEdBQTBCLElBQUEsWUFBQSxDQUFBOztBQUMxQixFQUFFLENBQUMsWUFBSCxHQUFrQiIsInNvdXJjZXNDb250ZW50IjpbIiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIyAgIFNjcmlwdDogQXVkaW9NYW5hZ2VyXG4jXG4jICAgJCRDT1BZUklHSFQkJFxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBBdWRpb01hbmFnZXJcbiAgICAjIyMqXG4gICAgKiBNYW5hZ2VzIHRoZSBhdWRpbyBwbGF5YmFjayBvZiB0aGUgZ2FtZS5cbiAgICAqXG4gICAgKiBAbW9kdWxlIGdzXG4gICAgKiBAY2xhc3MgQXVkaW9NYW5hZ2VyXG4gICAgKiBAbWVtYmVyb2YgZ3NcbiAgICAqIEBjb25zdHJ1Y3RvclxuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgICAjIyMqXG4gICAgICAgICogU3RvcmVzIGFsbCBhdWRpbyBidWZmZXJzLlxuICAgICAgICAqIEBwcm9wZXJ0eSBidWZmZXJzXG4gICAgICAgICogQHR5cGUgZ3MuQXVkaW9CdWZmZXJbXVxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBhdWRpb0J1ZmZlcnMgPSBbXVxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBTdG9yZXMgYWxsIGF1ZGlvIGJ1ZmZlcnMgYnkgbGF5ZXIuXG4gICAgICAgICogQHByb3BlcnR5IGJ1ZmZlcnNcbiAgICAgICAgKiBAdHlwZSBncy5BdWRpb0J1ZmZlcltdXG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyNcbiAgICAgICAgQGF1ZGlvQnVmZmVyc0J5TGF5ZXIgPSBbXVxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBTdG9yZXMgYWxsIGF1ZGlvIGJ1ZmZlciByZWZlcmVuY2VzIGZvciBzb3VuZHMuXG4gICAgICAgICogQHByb3BlcnR5IHNvdW5kUmVmZXJlbmNlc1xuICAgICAgICAqIEB0eXBlIGdzLkF1ZGlvQnVmZmVyUmVmZXJlbmNlW11cbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAc291bmRSZWZlcmVuY2VzID0ge31cblxuICAgICAgICAjIyMqXG4gICAgICAgICogQ3VycmVudCBNdXNpYyAoTGF5ZXIgMClcbiAgICAgICAgKiBAcHJvcGVydHkgbXVzaWNcbiAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAbXVzaWMgPSBudWxsXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIEN1cnJlbnQgbXVzaWMgdm9sdW1lLlxuICAgICAgICAqIEBwcm9wZXJ0eSBtdXNpY1ZvbHVtZVxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBtdXNpY1ZvbHVtZSA9IDEwMFxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBDdXJyZW50IHNvdW5kIHZvbHVtZS5cbiAgICAgICAgKiBAcHJvcGVydHkgc291bmRWb2x1bWVcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAc291bmRWb2x1bWUgPSAxMDBcblxuICAgICAgICAjIyMqXG4gICAgICAgICogQ3VycmVudCB2b2ljZSB2b2x1bWUuXG4gICAgICAgICogQHByb3BlcnR5IHZvaWNlVm9sdW1lXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyNcbiAgICAgICAgQHZvaWNlVm9sdW1lID0gMTAwXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIEdlbmVyYWwgbXVzaWMgdm9sdW1lXG4gICAgICAgICogQHByb3BlcnR5IGdlbmVyYWxNdXNpY1ZvbHVtZVxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBnZW5lcmFsTXVzaWNWb2x1bWUgPSAxMDBcblxuICAgICAgICAjIyMqXG4gICAgICAgICogR2VuZXJhbCBzb3VuZCB2b2x1bWVcbiAgICAgICAgKiBAcHJvcGVydHkgZ2VuZXJhbFNvdW5kVm9sdW1lXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyNcbiAgICAgICAgQGdlbmVyYWxTb3VuZFZvbHVtZSA9IDEwMFxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBHZW5lcmFsIHZvaWNlIHZvbHVtZVxuICAgICAgICAqIEBwcm9wZXJ0eSBnZW5lcmFsVm9pY2VWb2x1bWVcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAZ2VuZXJhbFZvaWNlVm9sdW1lID0gMTAwXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFN0b3JlcyBhdWRpbyBsYXllciBpbmZvLWRhdGEgZm9yIGVhY2ggbGF5ZXIuXG4gICAgICAgICogQHByb3BlcnR5IGF1ZGlvTGF5ZXJzXG4gICAgICAgICogQHR5cGUgZ3MuQXVkaW9MYXllckluZm9bXVxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBhdWRpb0xheWVycyA9IFtdXG5cbiAgICAjIyMqXG4gICAgKiBSZXN0b3JlcyBhdWRpby1wbGF5YmFjayBmcm9tIGEgc3BlY2lmaWVkIGFycmF5IG9mIGF1ZGlvIGxheWVycy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHJlc3RvcmVcbiAgICAqIEBwYXJhbSB7Z3MuQXVkaW9MYXllckluZm9bXX0gbGF5ZXJzIC0gQW4gYXJyYXkgb2YgYXVkaW8gbGF5ZXIgaW5mbyBvYmplY3RzLlxuICAgICMjI1xuICAgIHJlc3RvcmU6IChsYXllcnMpIC0+XG4gICAgICAgIEBhdWRpb0xheWVycyA9IGxheWVyc1xuXG4gICAgICAgIGZvciBsYXllciwgaSBpbiBsYXllcnNcbiAgICAgICAgICAgIGlmIGxheWVyIGFuZCBsYXllci5wbGF5aW5nXG4gICAgICAgICAgICAgICAgaWYgbGF5ZXIuY3VzdG9tRGF0YVxuICAgICAgICAgICAgICAgICAgICBAcGxheU11c2ljUmFuZG9tKGxheWVyLCBsYXllci5jdXN0b21EYXRhLmZhZGVUaW1lLCBpLCBsYXllci5jdXN0b21EYXRhLnBsYXlUaW1lLCBsYXllci5jdXN0b21EYXRhLnBsYXlSYW5nZSlcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEBwbGF5TXVzaWMobGF5ZXIsIGxheWVyLmZhZGVJblRpbWUsIGkpXG5cbiAgICAjIyMqXG4gICAgKiBMb2FkcyB0aGUgc3BlY2lmaWVkIG11c2ljLlxuICAgICpcbiAgICAqIEBtZXRob2QgbG9hZE11c2ljXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBtdXNpYyB0byBsb2FkLlxuICAgICMjI1xuICAgIGxvYWRNdXNpYzogKG5hbWUpIC0+XG4gICAgICAgIGlmIG5hbWU/XG4gICAgICAgICAgICBmb2xkZXIgPSBuYW1lLmZvbGRlclBhdGggPyBcIkF1ZGlvL011c2ljXCJcbiAgICAgICAgICAgIG5hbWUgPSAobmFtZS5uYW1lIHx8IG5hbWUpXG4gICAgICAgIGlmIG5hbWUgYW5kIG5hbWUubGVuZ3RoID4gMFxuICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEF1ZGlvU3RyZWFtKFwiI3tmb2xkZXJ9LyN7bmFtZX1cIilcblxuICAgICMjIypcbiAgICAqIExvYWRzIHRoZSBzcGVjaWZpZWQgc291bmQuXG4gICAgKlxuICAgICogQG1ldGhvZCBsb2FkU291bmRcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHNvdW5kIHRvIGxvYWQuXG4gICAgIyMjXG4gICAgbG9hZFNvdW5kOiAobmFtZSkgLT5cbiAgICAgICAgaWYgbmFtZT9cbiAgICAgICAgICAgIGZvbGRlciA9IG5hbWUuZm9sZGVyUGF0aCA/IFwiQXVkaW8vU291bmRzXCJcbiAgICAgICAgICAgIG5hbWUgPSBuYW1lLm5hbWUgfHwgbmFtZVxuICAgICAgICBpZiBuYW1lIGFuZCBuYW1lLmxlbmd0aCA+IDBcbiAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRBdWRpb0J1ZmZlcihcIiN7Zm9sZGVyfS8je25hbWV9XCIpXG5cbiAgICAjIyMqXG4gICAgKiBVcGRhdGVzIGEgcmFuZG9tbHkgcGxheWVkIGF1ZGlvIGJ1ZmZlci5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHVwZGF0ZVJhbmRvbUF1ZGlvXG4gICAgKiBAcGFyYW0ge2dzLkF1ZGlvQnVmZmVyfSBidWZmZXIgLSBUaGUgYXVkaW8gYnVmZmVyIHRvIHVwZGF0ZS5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICAjIEZJWE1FOiBSZWZhY3RvcmluZyBuZWNlc3NhcnkuXG4gICAgdXBkYXRlUmFuZG9tQXVkaW86IChidWZmZXIpIC0+XG4gICAgICAgIGlmIGJ1ZmZlci5jdXN0b21EYXRhLnN0YXJ0VGltZXIgPiAwXG4gICAgICAgICAgICBidWZmZXIuY3VzdG9tRGF0YS5zdGFydFRpbWVyLS1cbiAgICAgICAgICAgIGlmIGJ1ZmZlci5jdXN0b21EYXRhLnN0YXJ0VGltZXIgPD0gMFxuICAgICAgICAgICAgICAgIGJ1ZmZlci5mYWRlSW5Wb2x1bWUgPSAxLjAgLyAoYnVmZmVyLmN1c3RvbURhdGEuZmFkZVRpbWV8fDEpXG4gICAgICAgICAgICAgICAgYnVmZmVyLmZhZGVJblRpbWUgPSBidWZmZXIuY3VzdG9tRGF0YS5mYWRlVGltZXx8MVxuICAgICAgICAgICAgICAgIGJ1ZmZlci5mYWRlT3V0VGltZSA9IGJ1ZmZlci5jdXN0b21EYXRhLmZhZGVUaW1lfHwxXG4gICAgICAgICAgICAgICAgYnVmZmVyLnBsYXlUaW1lID0gYnVmZmVyLmN1c3RvbURhdGEucGxheVRpbWUubWluICsgTWF0aC5yYW5kb20oKSAqIChidWZmZXIuY3VzdG9tRGF0YS5wbGF5VGltZS5tYXggLSBidWZmZXIuY3VzdG9tRGF0YS5wbGF5VGltZS5taW4pXG4gICAgICAgICAgICAgICAgY3VycmVudFRpbWUgPSBidWZmZXIuY3VycmVudFRpbWUgIyAtIGJ1ZmZlci5zdGFydFRpbWVcbiAgICAgICAgICAgICAgICB0aW1lTGVmdCA9IGJ1ZmZlci5kdXJhdGlvbiAtIGN1cnJlbnRUaW1lXG4gICAgICAgICAgICAgICAgYnVmZmVyLnBsYXlUaW1lID0gTWF0aC5taW4odGltZUxlZnQgKiAxMDAwIC8gMTYuNiwgYnVmZmVyLnBsYXlUaW1lKVxuXG4gICAgICAgICAgICAgICAgYnVmZmVyLmN1c3RvbURhdGEuc3RhcnRUaW1lciA9IGJ1ZmZlci5wbGF5VGltZSArIGJ1ZmZlci5jdXN0b21EYXRhLnBsYXlSYW5nZS5zdGFydCArIE1hdGgucmFuZG9tKCkgKiAoYnVmZmVyLmN1c3RvbURhdGEucGxheVJhbmdlLmVuZCAtIGJ1ZmZlci5jdXN0b21EYXRhLnBsYXlSYW5nZS5zdGFydClcblxuICAgICMjIypcbiAgICAqIFVwZGF0ZXMgYWxsIGF1ZGlvLWJ1ZmZlcnMgZGVwZW5kaW5nIG9uIHRoZSBwbGF5LXR5cGUuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVBdWRpb0J1ZmZlcnNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICB1cGRhdGVBdWRpb0J1ZmZlcnM6IC0+XG4gICAgICAgIGZvciBidWZmZXIgaW4gQGF1ZGlvQnVmZmVyc1xuICAgICAgICAgICAgaWYgYnVmZmVyP1xuICAgICAgICAgICAgICAgIGlmIGJ1ZmZlci5jdXN0b21EYXRhLnBsYXlUeXBlID09IDFcbiAgICAgICAgICAgICAgICAgICAgQHVwZGF0ZVJhbmRvbUF1ZGlvKGJ1ZmZlcilcblxuICAgICAgICAgICAgICAgIGlmIEdhbWVNYW5hZ2VyLnNldHRpbmdzLmJnbVZvbHVtZSAhPSBAZ2VuZXJhbE11c2ljVm9sdW1lXG4gICAgICAgICAgICAgICAgICAgIGJ1ZmZlci52b2x1bWUgPSAoYnVmZmVyLmN1c3RvbURhdGEuaW5pdGlhbFZvbHVtZSAqIEBtdXNpY1ZvbHVtZSAqIEdhbWVNYW5hZ2VyLnNldHRpbmdzLmJnbVZvbHVtZSAvIDEwMDAwKSAvIDEwMFxuXG4gICAgICAgICAgICAgICAgYnVmZmVyLnVwZGF0ZSgpXG4gICAgICAgIGlmIEdhbWVNYW5hZ2VyLnNldHRpbmdzLmJnbVZvbHVtZSAhPSBAZ2VuZXJhbE11c2ljVm9sdW1lXG4gICAgICAgICAgICBAZ2VuZXJhbE11c2ljVm9sdW1lID0gR2FtZU1hbmFnZXIuc2V0dGluZ3MuYmdtVm9sdW1lXG5cblxuICAgICMjIypcbiAgICAqIFVwZGF0ZXMgYWxsIGF1ZGlvLWJ1ZmZlcnMgZGVwZW5kaW5nIG9uIHRoZSBwbGF5LXR5cGUuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVBdWRpb0J1ZmZlcnNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICB1cGRhdGVHZW5lcmFsVm9sdW1lOiAtPlxuICAgICAgICBpZiBHYW1lTWFuYWdlci5zZXR0aW5ncy5zZVZvbHVtZSAhPSBAZ2VuZXJhbFNvdW5kVm9sdW1lIG9yIEdhbWVNYW5hZ2VyLnNldHRpbmdzLnZvaWNlVm9sdW1lICE9IEBnZW5lcmFsVm9pY2VWb2x1bWVcbiAgICAgICAgICAgIEBnZW5lcmFsU291bmRWb2x1bWUgPSBHYW1lTWFuYWdlci5zZXR0aW5ncy5zZVZvbHVtZVxuICAgICAgICAgICAgQGdlbmVyYWxWb2ljZVZvbHVtZSA9IEdhbWVNYW5hZ2VyLnNldHRpbmdzLnZvaWNlVm9sdW1lXG4gICAgICAgICAgICBmb3IgayBvZiBAc291bmRSZWZlcmVuY2VzXG4gICAgICAgICAgICAgICAgZm9yIHJlZmVyZW5jZSBpbiBAc291bmRSZWZlcmVuY2VzW2tdXG4gICAgICAgICAgICAgICAgICAgIGlmIHJlZmVyZW5jZS52b2ljZVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlLnZvbHVtZSA9IChyZWZlcmVuY2UuY3VzdG9tRGF0YS5pbml0aWFsVm9sdW1lICogQHZvaWNlVm9sdW1lICogR2FtZU1hbmFnZXIuc2V0dGluZ3Mudm9pY2VWb2x1bWUgLyAxMDAwMCkgLyAxMDBcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlLnZvbHVtZSA9IChyZWZlcmVuY2UuY3VzdG9tRGF0YS5pbml0aWFsVm9sdW1lICogQHNvdW5kVm9sdW1lICogR2FtZU1hbmFnZXIuc2V0dGluZ3Muc2VWb2x1bWUgLyAxMDAwMCkgLyAxMDBcbiAgICAjIyMqXG4gICAgKiBVcGRhdGVzIHRoZSBhdWRpby1wbGF5YmFjay5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHVwZGF0ZVxuICAgICMjI1xuICAgIHVwZGF0ZTogLT5cbiAgICAgICAgQHVwZGF0ZUF1ZGlvQnVmZmVycygpXG4gICAgICAgIEB1cGRhdGVHZW5lcmFsVm9sdW1lKClcblxuICAgICMjIypcbiAgICAqIENoYW5nZXMgdGhlIGN1cnJlbnQgbXVzaWMgdG8gdGhlIHNwZWNpZmllZCBvbmUuXG4gICAgKlxuICAgICogQG1ldGhvZCBjaGFuZ2VNdXNpY1xuICAgICogQHBhcmFtIHtPYmplY3R9IG11c2ljIC0gVGhlIG11c2ljIHRvIHBsYXkuIElmIDxiPm51bGw8L2I+IHRoZSBjdXJyZW50IG11c2ljIHdpbGwgc3RvcCBwbGF5aW5nLlxuICAgICMjI1xuICAgIGNoYW5nZU11c2ljOiAobXVzaWMpIC0+XG4gICAgICAgIGlmIG11c2ljPyBhbmQgbXVzaWMubmFtZT9cbiAgICAgICAgICAgIGlmIEBtdXNpYz8gYW5kIEBtdXNpYy5uYW1lICE9IG11c2ljLm5hbWVcbiAgICAgICAgICAgICAgICBAcGxheU11c2ljKG11c2ljKVxuICAgICAgICAgICAgZWxzZSBpZiBub3QgQG11c2ljP1xuICAgICAgICAgICAgICAgIEBwbGF5TXVzaWMobXVzaWMpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzdG9wTXVzaWMoKVxuXG4gICAgIyBGSVhNRTogSXMgdGhpcyBzdGlsbCB1c2VkP1xuICAgICMjIypcbiAgICAqIFByZXBhcmVzLlxuICAgICpcbiAgICAqIEBtZXRob2QgcHJlcGFyZVxuICAgICogQHBhcmFtIHtPYmplY3R9IG11c2ljIC0gVGhlIG11c2ljIHRvIHBsYXkuIElmIDxiPm51bGw8L2I+IHRoZSBjdXJyZW50IG11c2ljIHdpbGwgc3RvcCBwbGF5aW5nLlxuICAgICMjI1xuICAgIHByZXBhcmU6IChwYXRoLCB2b2x1bWUsIHJhdGUpIC0+XG4gICAgICAgIGJ1ZmZlciA9IFJlc291cmNlTWFuYWdlci5nZXRBdWRpb0J1ZmZlcihwYXRoKVxuXG4gICAgICAgIGlmIGJ1ZmZlci5kZWNvZGVkXG4gICAgICAgICAgICBidWZmZXIudm9sdW1lID0gaWYgdm9sdW1lPyB0aGVuIHZvbHVtZSAvIDEwMCBlbHNlIDEuMFxuICAgICAgICAgICAgYnVmZmVyLnBsYXliYWNrUmF0ZSA9IGlmIHJhdGU/IHRoZW4gcmF0ZSAvIDEwMCBlbHNlIDEuMFxuICAgICAgICBlbHNlXG4gICAgICAgICAgIGJ1ZmZlci5vbkZpbmlzaERlY29kZSA9IChzb3VyY2UpID0+XG4gICAgICAgICAgICAgICBzb3VyY2Uudm9sdW1lID0gaWYgdm9sdW1lPyB0aGVuIHZvbHVtZSAvIDEwMCBlbHNlIDEuMFxuICAgICAgICAgICAgICAgc291cmNlLnBsYXliYWNrUmF0ZSA9IGlmIHJhdGU/IHRoZW4gcmF0ZSAvIDEwMCBlbHNlIDEuMFxuICAgICAgICAgICBidWZmZXIuZGVjb2RlKClcblxuICAgICAgICByZXR1cm4gYnVmZmVyXG5cbiAgICAjIyMqXG4gICAgKiBQbGF5cyBhbiBhdWRpbyByZXNvdXJjZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHBsYXlcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIC0gVGhlIHBhdGggdG8gdGhlIGF1ZGlvIHJlc291cmNlLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHZvbHVtZSAtIFRoZSB2b2x1bWUuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gcmF0ZSAtIFRoZSBwbGF5YmFjayByYXRlLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGZhZGVJblRpbWUgLSBUaGUgZmFkZS1pbiB0aW1lIGluIGZyYW1lcy5cbiAgICAjIyNcbiAgICBwbGF5OiAocGF0aCwgdm9sdW1lLCByYXRlLCBmYWRlSW5UaW1lKSAtPlxuICAgICAgICBidWZmZXIgPSBSZXNvdXJjZU1hbmFnZXIuZ2V0QXVkaW9TdHJlYW0ocGF0aClcblxuICAgICAgICBpZiBidWZmZXIuZGVjb2RlZFxuICAgICAgICAgICAgYnVmZmVyLnZvbHVtZSA9IGlmIHZvbHVtZT8gdGhlbiB2b2x1bWUgLyAxMDAgZWxzZSAxLjBcbiAgICAgICAgICAgIGJ1ZmZlci5wbGF5YmFja1JhdGUgPSBpZiByYXRlPyB0aGVuIHJhdGUgLyAxMDAgZWxzZSAxLjBcbiAgICAgICAgICAgIGJ1ZmZlci5wbGF5KGZhZGVJblRpbWUpIGlmIEdhbWVNYW5hZ2VyLnNldHRpbmdzLmJnbUVuYWJsZWRcbiAgICAgICAgZWxzZVxuICAgICAgICAgICBidWZmZXIub25GaW5pc2hEZWNvZGUgPSAoc291cmNlKSA9PlxuICAgICAgICAgICAgICAgc291cmNlLnZvbHVtZSA9IGlmIHZvbHVtZT8gdGhlbiB2b2x1bWUgLyAxMDAgZWxzZSAxLjBcbiAgICAgICAgICAgICAgIHNvdXJjZS5wbGF5YmFja1JhdGUgPSBpZiByYXRlPyB0aGVuIHJhdGUgLyAxMDAgZWxzZSAxLjBcbiAgICAgICAgICAgICAgIHNvdXJjZS5wbGF5KGZhZGVJblRpbWUpIGlmIEdhbWVNYW5hZ2VyLnNldHRpbmdzLmJnbUVuYWJsZWRcbiAgICAgICAgICAgYnVmZmVyLmRlY29kZSgpXG5cbiAgICAgICAgcmV0dXJuIGJ1ZmZlclxuXG4gICAgIyMjKlxuICAgICogU3RvcHMgYWxsIHNvdW5kcy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHN0b3BBbGxTb3VuZHNcbiAgICAjIyNcbiAgICBzdG9wQWxsU291bmRzOiAtPlxuICAgICAgICBmb3IgayBvZiBAc291bmRSZWZlcmVuY2VzXG4gICAgICAgICAgICBmb3IgcmVmZXJlbmNlIGluIEBzb3VuZFJlZmVyZW5jZXNba11cbiAgICAgICAgICAgICAgICByZWZlcmVuY2U/LnN0b3AoKVxuXG4gICAgIyMjKlxuICAgICogU3RvcHMgYSBzb3VuZCBhbmQgYWxsIHJlZmVyZW5jZXMgb2YgaXQuXG4gICAgKlxuICAgICogQG1ldGhvZCBzdG9wU291bmRcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHNvdW5kIHRvIHN0b3AuXG4gICAgIyMjXG4gICAgc3RvcFNvdW5kOiAobmFtZSkgLT5cbiAgICAgICAgaWYgQHNvdW5kUmVmZXJlbmNlc1tuYW1lXT9cbiAgICAgICAgICAgIGZvciByZWZlcmVuY2UgaW4gQHNvdW5kUmVmZXJlbmNlc1tuYW1lXVxuICAgICAgICAgICAgICAgIHJlZmVyZW5jZS5zdG9wKClcblxuXG4gICAgIyMjKlxuICAgICogU3RvcHMgYSB2b2ljZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHN0b3BWb2ljZVxuICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgdm9pY2UgdG8gc3RvcC5cbiAgICAjIyNcbiAgICBzdG9wVm9pY2U6IChuYW1lKSAtPlxuICAgICAgICBAc3RvcFNvdW5kKG5hbWUpXG5cbiAgICAjIyMqXG4gICAgKiBTdG9wcyBhbGwgdm9pY2VzLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc3RvcEFsbFZvaWNlc1xuICAgICMjI1xuICAgIHN0b3BBbGxWb2ljZXM6IC0+XG4gICAgICAgIGZvciBrIG9mIEBzb3VuZFJlZmVyZW5jZXNcbiAgICAgICAgICAgIGZvciByZWZlcmVuY2UgaW4gQHNvdW5kUmVmZXJlbmNlc1trXVxuICAgICAgICAgICAgICAgIHJlZmVyZW5jZS5zdG9wKCkgaWYgcmVmZXJlbmNlLnZvaWNlXG5cbiAgICAjIyMqXG4gICAgKiBQbGF5cyBhIHZvaWNlLlxuICAgICpcbiAgICAqIEBtZXRob2QgcGxheVZvaWNlXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSB2b2ljZSB0byBwbGF5LlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHZvbHVtZSAtIFRoZSB2b2ljZSB2b2x1bWUuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gcmF0ZSAtIFRoZSB2b2ljZSBwbGF5YmFjayByYXRlLlxuICAgICMjI1xuICAgIHBsYXlWb2ljZTogKG5hbWUsIHZvbHVtZSwgcmF0ZSkgLT5cbiAgICAgICAgdm9pY2UgPSBudWxsXG4gICAgICAgIGlmIEdhbWVNYW5hZ2VyLnNldHRpbmdzLnZvaWNlRW5hYmxlZCBhbmQgbm90ICRQQVJBTVMucHJldmlldz8uc2V0dGluZ3Mudm9pY2VEaXNhYmxlZFxuICAgICAgICAgICAgdm9pY2UgPSBAcGxheVNvdW5kKG5hbWUsIHZvbHVtZSB8fCBHYW1lTWFuYWdlci5kZWZhdWx0cy5hdWRpby52b2ljZVZvbHVtZSwgcmF0ZSB8fCBHYW1lTWFuYWdlci5kZWZhdWx0cy5hdWRpby52b2ljZVBsYXliYWNrUmF0ZSwgbm8sIHllcylcblxuICAgICAgICByZXR1cm4gdm9pY2VcblxuICAgICMjIypcbiAgICAqIFBsYXlzIGEgc291bmQuXG4gICAgKlxuICAgICogQG1ldGhvZCBwbGF5U291bmRcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHNvdW5kIHRvIHBsYXkuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gdm9sdW1lIC0gVGhlIHNvdW5kJ3Mgdm9sdW1lLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHJhdGUgLSBUaGUgc291bmQncyBwbGF5YmFjayByYXRlLlxuICAgICogQHBhcmFtIHtib29sZWFufSBtdXNpY0VmZmVjdCAtIEluZGljYXRlcyBpZiB0aGUgc291bmQgc2hvdWxkIGJlIHBsYXllZCBhcyBhIG11c2ljIGVmZmVjdC4gSW4gdGhhdCBjYXNlLCB0aGUgY3VycmVudCBtdXNpY1xuICAgICogYXQgYXVkaW8tbGF5ZXIgd2lsbCBiZSBwYXVzZWQgdW50aWwgdGhlIHNvdW5kIGZpbmlzaGVzIHBsYXlpbmcuXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IHZvaWNlIC0gSW5kaWNhdGVzIGlmIHRoZSBzb3VuZCBzaG91bGQgYmUgaGFuZGxlZCBhcyBhIHZvaWNlLlxuICAgICMjI1xuICAgIHBsYXlTb3VuZDogKG5hbWUsIHZvbHVtZSwgcmF0ZSwgbXVzaWNFZmZlY3QsIHZvaWNlLCBsb29wU291bmQpIC0+XG4gICAgICAgIGlmICRQQVJBTVMucHJldmlldz8uc2V0dGluZ3Muc291bmREaXNhYmxlZCB0aGVuIHJldHVyblxuICAgICAgICBpZiBub3QgbmFtZT8gb3IgKCF2b2ljZSBhbmQgIUdhbWVNYW5hZ2VyLnNldHRpbmdzLnNvdW5kRW5hYmxlZCkgdGhlbiByZXR1cm5cbiAgICAgICAgZm9sZGVyID0gXCJBdWRpby9Tb3VuZHNcIlxuICAgICAgICBpZiBuYW1lLm5hbWU/XG4gICAgICAgICAgICB2b2x1bWUgPSB2b2x1bWUgPyBuYW1lLnZvbHVtZVxuICAgICAgICAgICAgcmF0ZSA9IHJhdGUgPyBuYW1lLnBsYXliYWNrUmF0ZVxuICAgICAgICAgICAgZm9sZGVyID0gbmFtZS5mb2xkZXJQYXRoID8gZm9sZGVyXG4gICAgICAgICAgICBuYW1lID0gbmFtZS5uYW1lXG5cbiAgICAgICAgaWYgbmFtZS5sZW5ndGggPT0gMCB0aGVuIHJldHVyblxuXG4gICAgICAgIHJhdGUgPz0gMTAwXG4gICAgICAgIHZvbHVtZSA/PSAxMDBcblxuICAgICAgICBpZiBtdXNpY0VmZmVjdFxuICAgICAgICAgICAgQHN0b3BNdXNpYygpXG5cbiAgICAgICAgaWYgbm90IEBzb3VuZFJlZmVyZW5jZXNbbmFtZV0/XG4gICAgICAgICAgICBAc291bmRSZWZlcmVuY2VzW25hbWVdID0gW11cblxuICAgICAgICB2b2x1bWUgPSB2b2x1bWUgPyAxMDBcbiAgICAgICAgaW5pdGlhbFZvbHVtZSA9IHZvbHVtZVxuICAgICAgICB2b2x1bWUgKj0gaWYgdm9pY2UgdGhlbiBAZ2VuZXJhbFZvaWNlVm9sdW1lIC8gMTAwIGVsc2UgQGdlbmVyYWxTb3VuZFZvbHVtZSAvIDEwMFxuXG4gICAgICAgIHJlZmVyZW5jZSA9IG51bGxcbiAgICAgICAgZm9yIHIgaW4gQHNvdW5kUmVmZXJlbmNlc1tuYW1lXVxuICAgICAgICAgICAgaWYgbm90IHIuaXNQbGF5aW5nXG4gICAgICAgICAgICAgICAgcmVmZXJlbmNlID0gclxuICAgICAgICAgICAgICAgIGlmIG11c2ljRWZmZWN0IHRoZW4gcmVmZXJlbmNlLm9uRW5kID0gPT4gQHJlc3VtZU11c2ljKDQwKVxuICAgICAgICAgICAgICAgIHJlZmVyZW5jZS5jdXN0b21EYXRhLmluaXRpYWxWb2x1bWUgPSBpbml0aWFsVm9sdW1lXG4gICAgICAgICAgICAgICAgcmVmZXJlbmNlLnZvaWNlID0gdm9pY2VcbiAgICAgICAgICAgICAgICByZWZlcmVuY2Uudm9sdW1lID0gdm9sdW1lIC8gMTAwXG4gICAgICAgICAgICAgICAgcmVmZXJlbmNlLnBsYXliYWNrUmF0ZSA9IHJhdGUgLyAxMDBcbiAgICAgICAgICAgICAgICByZWZlcmVuY2UubG9vcCA9IGxvb3BTb3VuZFxuICAgICAgICAgICAgICAgIEB2b2ljZSA9IHJlZmVyZW5jZSBpZiB2b2ljZVxuICAgICAgICAgICAgICAgIGlmIHZvaWNlIGFuZCAhcmVmZXJlbmNlLnVzZUFuYWx5c2VyXG4gICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZS51c2VBbmFseXNlciA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlLmNyZWF0ZUFuYWx5c2VyKClcbiAgICAgICAgICAgICAgICByZWZlcmVuY2UucGxheSgpXG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICBpZiBub3QgcmVmZXJlbmNlP1xuICAgICAgICAgICAgYnVmZmVyID0gUmVzb3VyY2VNYW5hZ2VyLmdldEF1ZGlvQnVmZmVyKFwiI3tmb2xkZXJ9LyN7bmFtZX1cIilcbiAgICAgICAgICAgIGlmIGJ1ZmZlciBhbmQgYnVmZmVyLmxvYWRlZFxuICAgICAgICAgICAgICAgIGlmIGJ1ZmZlci5kZWNvZGVkXG4gICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZSA9IG5ldyBHUy5BdWRpb0J1ZmZlclJlZmVyZW5jZShidWZmZXIsIHZvaWNlKVxuICAgICAgICAgICAgICAgICAgICBpZiBtdXNpY0VmZmVjdCB0aGVuIHJlZmVyZW5jZS5vbkVuZCA9ID0+IEByZXN1bWVNdXNpYyg0MClcbiAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlLmN1c3RvbURhdGEuaW5pdGlhbFZvbHVtZSA9IGluaXRpYWxWb2x1bWVcbiAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlLnZvbHVtZSA9IHZvbHVtZSAvIDEwMFxuICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2UucGxheWJhY2tSYXRlID0gcmF0ZSAvIDEwMFxuICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2Uudm9pY2UgPSB2b2ljZVxuICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2UubG9vcCA9IGxvb3BTb3VuZFxuICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2UucGxheSgpXG4gICAgICAgICAgICAgICAgICAgIEB2b2ljZSA9IHJlZmVyZW5jZSBpZiB2b2ljZVxuICAgICAgICAgICAgICAgICAgICBAc291bmRSZWZlcmVuY2VzW25hbWVdLnB1c2gocmVmZXJlbmNlKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgYnVmZmVyLm5hbWUgPSBuYW1lXG4gICAgICAgICAgICAgICAgICAgIGJ1ZmZlci5vbkRlY29kZUZpbmlzaCA9IChzb3VyY2UpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2UgPSBuZXcgR1MuQXVkaW9CdWZmZXJSZWZlcmVuY2Uoc291cmNlLCB2b2ljZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG11c2ljRWZmZWN0IHRoZW4gcmVmZXJlbmNlLm9uRW5kID0gPT4gQHJlc3VtZU11c2ljKDQwKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlLnZvaWNlID0gdm9pY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZS5jdXN0b21EYXRhLmluaXRpYWxWb2x1bWUgPSBpbml0aWFsVm9sdW1lXG4gICAgICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2Uudm9sdW1lID0gdm9sdW1lIC8gMTAwXG4gICAgICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2UucGxheWJhY2tSYXRlID0gcmF0ZSAvIDEwMFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlLmxvb3AgPSBsb29wU291bmRcbiAgICAgICAgICAgICAgICAgICAgICAgIEB2b2ljZSA9IHJlZmVyZW5jZSBpZiB2b2ljZVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlLnBsYXkoKVxuICAgICAgICAgICAgICAgICAgICAgICAgQHNvdW5kUmVmZXJlbmNlc1tzb3VyY2UubmFtZV0ucHVzaChyZWZlcmVuY2UpXG4gICAgICAgICAgICAgICAgICAgIGJ1ZmZlci5kZWNvZGUoKVxuXG4gICAgICAgIHJldHVybiByZWZlcmVuY2VcblxuICAgICMjIypcbiAgICAqIFBsYXlzIGEgbXVzaWMgYXMgYSByYW5kb20gbXVzaWMuIEEgcmFuZG9tIG11c2ljIHdpbGwgZmFkZS1pbiBhbmQgZmFkZS1vdXRcbiAgICAqIGF0IHJhbmRvbSB0aW1lcy4gVGhhdCBjYW4gYmUgY29tYmluZWQgd2l0aCBvdGhlciBhdWRpby1sYXllcnMgdG8gY3JlYXRlIGFcbiAgICAqIG11Y2ggYmV0dGVyIGxvb3Bpbmcgb2YgYW4gYXVkaW8gdHJhY2suXG4gICAgKlxuICAgICogQG1ldGhvZCBwbGF5TXVzaWNSYW5kb21cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBtdXNpYyAtIFRoZSBtdXNpYyB0byBwbGF5LlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGZhZGVUaW1lIC0gVGhlIHRpbWUgZm9yIGEgc2luZ2xlIGZhZGUtaW4vb3V0IGluIGZyYW1lcy5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBsYXllciAtIFRoZSBhdWRpbyBsYXllciB0byB1c2UuXG4gICAgKiBAcGFyYW0ge2dzLlJhbmdlfSBwbGF5VGltZSAtIFBsYXktVGltZSByYW5nZSBsaWtlIDEwcyB0byAzMHMuXG4gICAgKiBAcGFyYW0ge2dzLlJhbmdlfSBwbGF5UmFuZ2UgLSBQbGF5LVJhbmdlLlxuICAgICMjI1xuICAgIHBsYXlNdXNpY1JhbmRvbTogKG11c2ljLCBmYWRlVGltZSwgbGF5ZXIsIHBsYXlUaW1lLCBwbGF5UmFuZ2UpIC0+XG4gICAgICAgIHJldHVybiBpZiAkUEFSQU1TLnByZXZpZXc/LnNldHRpbmdzLm11c2ljRGlzYWJsZWRcbiAgICAgICAgbGF5ZXIgPSBsYXllciA/IDBcblxuICAgICAgICB2b2x1bWUgPSBpZiBtdXNpYy52b2x1bWU/IHRoZW4gbXVzaWMudm9sdW1lIGVsc2UgMTAwXG4gICAgICAgIGluaXRpYWxWb2x1bWUgPSB2b2x1bWVcbiAgICAgICAgdm9sdW1lID0gdm9sdW1lICogKEBnZW5lcmFsTXVzaWNWb2x1bWUgLyAxMDApXG4gICAgICAgIEBkaXNwb3NlTXVzaWMobGF5ZXIpXG5cbiAgICAgICAgaWYgbXVzaWMubmFtZT8gYW5kIG11c2ljLm5hbWUubGVuZ3RoID4gMFxuICAgICAgICAgICAgbXVzaWNCdWZmZXIgPSBAcGxheShcIiN7bXVzaWMuZm9sZGVyUGF0aCA/IFwiQXVkaW8vTXVzaWNcIn0vI3ttdXNpYy5uYW1lfVwiLCB2b2x1bWUsIG11c2ljLnJhdGUpXG4gICAgICAgICAgICBtdXNpY0J1ZmZlci5sb29wID0geWVzXG4gICAgICAgICAgICBtdXNpY0J1ZmZlci52b2x1bWUgPSAwXG4gICAgICAgICAgICBtdXNpY0J1ZmZlci5kdXJhdGlvbiA9IE1hdGgucm91bmQobXVzaWNCdWZmZXIuZHVyYXRpb24gKiAxMDAwIC8gMTYuNilcbiAgICAgICAgICAgIG11c2ljQnVmZmVyLmN1c3RvbURhdGEucGxheVR5cGUgPSAxXG4gICAgICAgICAgICBtdXNpY0J1ZmZlci5jdXN0b21EYXRhLnBsYXlUaW1lID0gcGxheVRpbWVcbiAgICAgICAgICAgIG11c2ljQnVmZmVyLmN1c3RvbURhdGEuaW5pdGlhbFZvbHVtZSA9IGluaXRpYWxWb2x1bWVcbiAgICAgICAgICAgIGlmIHBsYXlSYW5nZS5lbmQgPT0gMFxuICAgICAgICAgICAgICAgIG11c2ljQnVmZmVyLmN1c3RvbURhdGEucGxheVJhbmdlID0geyBzdGFydDogcGxheVJhbmdlLnN0YXJ0LCBlbmQ6IG11c2ljQnVmZmVyLmR1cmF0aW9uIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBtdXNpY0J1ZmZlci5jdXN0b21EYXRhLnBsYXlSYW5nZSA9IHBsYXlSYW5nZVxuICAgICAgICAgICAgbXVzaWNCdWZmZXIuY3VzdG9tRGF0YS5mYWRlVGltZSA9IGZhZGVUaW1lXG5cbiAgICAgICAgICAgIG11c2ljQnVmZmVyLmN1c3RvbURhdGEuc3RhcnRUaW1lciA9IE1hdGgucm91bmQobXVzaWNCdWZmZXIuY3VzdG9tRGF0YS5wbGF5UmFuZ2Uuc3RhcnQgKyBNYXRoLnJhbmRvbSgpICogKG11c2ljQnVmZmVyLmN1c3RvbURhdGEucGxheVJhbmdlLmVuZCAtIG11c2ljQnVmZmVyLmN1c3RvbURhdGEucGxheVJhbmdlLnN0YXJ0KSlcblxuICAgICAgICAgICAgQGF1ZGlvQnVmZmVycy5wdXNoKG11c2ljQnVmZmVyKSBpZiBub3QgQGF1ZGlvQnVmZmVycy5jb250YWlucyhtdXNpY0J1ZmZlcilcbiAgICAgICAgICAgIEBhdWRpb0J1ZmZlcnNCeUxheWVyW2xheWVyXSA9IG11c2ljQnVmZmVyXG4gICAgICAgICAgICBAYXVkaW9MYXllcnNbbGF5ZXJdID0gbmFtZTogbXVzaWMubmFtZSwgdGltZTogbXVzaWMuY3VycmVudFRpbWUsIHZvbHVtZTogbXVzaWMudm9sdW1lLCByYXRlOiBtdXNpYy5wbGF5YmFja1JhdGUsIGZhZGVJblRpbWU6IGZhZGVUaW1lLCBjdXN0b21EYXRhOiBtdXNpY0J1ZmZlci5jdXN0b21EYXRhXG5cbiAgICAjIyMqXG4gICAgKiBQbGF5cyBhIG11c2ljLlxuICAgICpcbiAgICAqIEBtZXRob2QgcGxheU11c2ljXG4gICAgKiBAcGFyYW0ge3N0cmluZ3xPYmplY3R9IG5hbWUgLSBUaGUgbXVzaWMgdG8gcGxheS4gQ2FuIGJlIGp1c3QgYSBuYW1lIG9yIGEgbXVzaWMgZGF0YS1vYmplY3QuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gdm9sdW1lIC0gVGhlIG11c2ljJ3Mgdm9sdW1lIGluIHBlcmNlbnQuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gcmF0ZSAtIFRoZSBtdXNpYydzIHBsYXliYWNrIHJhdGUgaW4gcGVyY2VudC5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBmYWRlSW5UaW1lIC0gVGhlIGZhZGUtaW4gdGltZS5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBsYXllciAtIFRoZSBsYXllciB0byBwbGF5IHRoZSBtdXNpYyBvbi5cbiAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gbG9vcCAtIEluZGljYXRlcyBpZiB0aGUgbXVzaWMgc2hvdWxkIGJlIGxvb3BlZFxuICAgICMjI1xuICAgIHBsYXlNdXNpYzogKG5hbWUsIHZvbHVtZSwgcmF0ZSwgZmFkZUluVGltZSwgbGF5ZXIsIGxvb3BNdXNpYykgLT5cbiAgICAgICAgcmV0dXJuIGlmICRQQVJBTVMucHJldmlldz8uc2V0dGluZ3MubXVzaWNEaXNhYmxlZFxuICAgICAgICBsb29wTXVzaWMgPz0geWVzXG4gICAgICAgIGZvbGRlciA9IFwiQXVkaW8vTXVzaWNcIlxuICAgICAgICBpZiBuYW1lPyBhbmQgbmFtZS5uYW1lP1xuICAgICAgICAgICAgbGF5ZXIgPSBpZiBsYXllcj8gdGhlbiBsYXllciBlbHNlIHJhdGUgfHwgMFxuICAgICAgICAgICAgZmFkZUluVGltZSA9IHZvbHVtZVxuICAgICAgICAgICAgdm9sdW1lID0gdm9sdW1lID8gbmFtZS52b2x1bWVcbiAgICAgICAgICAgIHJhdGUgPSByYXRlID8gbmFtZS5wbGF5YmFja1JhdGVcbiAgICAgICAgICAgIGZvbGRlciA9IG5hbWUuZm9sZGVyUGF0aCA/IGZvbGRlclxuICAgICAgICAgICAgbmFtZSA9IG5hbWUubmFtZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBsYXllciA9IGxheWVyID8gMFxuXG4gICAgICAgIEBkaXNwb3NlTXVzaWMobGF5ZXIpXG4gICAgICAgIEBhdWRpb0xheWVyc1tsYXllcl0gPSBuYW1lOiBuYW1lLCB2b2x1bWU6IHZvbHVtZSwgcmF0ZTogcmF0ZSwgZmFkZUluVGltZTogZmFkZUluVGltZSwgcGxheWluZzogdHJ1ZVxuXG4gICAgICAgIHZvbHVtZSA9IGlmIHZvbHVtZT8gdGhlbiB2b2x1bWUgZWxzZSAxMDBcbiAgICAgICAgaW5pdGlhbFZvbHVtZSA9IHZvbHVtZVxuICAgICAgICB2b2x1bWUgPSB2b2x1bWUgKiAoQGdlbmVyYWxNdXNpY1ZvbHVtZSAvIDEwMClcbiAgICAgICAgXG5cblxuICAgICAgICBpZiBuYW1lPyBhbmQgbmFtZS5sZW5ndGggPiAwXG4gICAgICAgICAgICBAbXVzaWMgPSBuYW1lOiBuYW1lXG4gICAgICAgICAgICBtdXNpY0J1ZmZlciA9IEBwbGF5KFwiI3tmb2xkZXJ9LyN7bmFtZX1cIiwgdm9sdW1lLCByYXRlLCBmYWRlSW5UaW1lKVxuICAgICAgICAgICAgbXVzaWNCdWZmZXIubG9vcCA9IGxvb3BNdXNpY1xuICAgICAgICAgICAgbXVzaWNCdWZmZXIuY3VzdG9tRGF0YS5pbml0aWFsVm9sdW1lID0gaW5pdGlhbFZvbHVtZVxuICAgICAgICAgICAgQGF1ZGlvQnVmZmVycy5wdXNoKG11c2ljQnVmZmVyKSBpZiBub3QgQGF1ZGlvQnVmZmVycy5jb250YWlucyhtdXNpY0J1ZmZlcilcbiAgICAgICAgICAgIEBhdWRpb0J1ZmZlcnNCeUxheWVyW2xheWVyXSA9IG11c2ljQnVmZmVyXG5cbiAgICAgICAgcmV0dXJuIG11c2ljQnVmZmVyXG5cbiAgICAjIyMqXG4gICAgKiBSZXN1bWVzIGEgcGF1c2VkIG11c2ljLlxuICAgICpcbiAgICAqIEBtZXRob2QgcmVzdW1lTXVzaWNcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBmYWRlSW5UaW1lIC0gVGhlIGZhZGUtaW4gdGltZSBpbiBmcmFtZXMuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gbGF5ZXIgLSBUaGUgYXVkaW8gbGF5ZXIgdG8gcmVzdW1lLlxuICAgICMjI1xuICAgIHJlc3VtZU11c2ljOiAoZmFkZUluVGltZSwgbGF5ZXIpIC0+XG4gICAgICAgIGxheWVyID0gbGF5ZXIgPyAwXG4gICAgICAgIGlmIEBhdWRpb0J1ZmZlcnNCeUxheWVyW2xheWVyXT8gYW5kIG5vdCBAYXVkaW9CdWZmZXJzQnlMYXllcltsYXllcl0uaXNQbGF5aW5nXG4gICAgICAgICAgICBAYXVkaW9CdWZmZXJzQnlMYXllcltsYXllcl0ucmVzdW1lKGZhZGVJblRpbWUpXG4gICAgICAgICAgICBAYXVkaW9MYXllcnNbbGF5ZXJdPy5wbGF5aW5nID0gdHJ1ZVxuXG4gICAgIyMjKlxuICAgICogU3RvcHMgYSBtdXNpYy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHN0b3BNdXNpY1xuICAgICogQHBhcmFtIHtudW1iZXJ9IGZhZGVPdXRUaW1lIC0gVGhlIGZhZGUtb3V0IHRpbWUgaW4gZnJhbWVzLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGxheWVyIC0gVGhlIGF1ZGlvIGxheWVyIHRvIHN0b3AuXG4gICAgIyMjXG4gICAgc3RvcE11c2ljOiAoZmFkZU91dFRpbWUsIGxheWVyKSAtPlxuICAgICAgICBsYXllciA9IGxheWVyID8gMFxuICAgICAgICBAYXVkaW9CdWZmZXJzQnlMYXllcltsYXllcl0/LnN0b3AoZmFkZU91dFRpbWUpXG4gICAgICAgIEBhdWRpb0J1ZmZlcnNCeUxheWVyW2xheWVyXT8uY3VzdG9tRGF0YSA9IHsgaW5pdGlhbFZvbHVtZTogQGF1ZGlvQnVmZmVyc0J5TGF5ZXJbbGF5ZXJdPy5jdXN0b21EYXRhLmluaXRpYWxWb2x1bWUgfVxuICAgICAgICBAYXVkaW9MYXllcnNbbGF5ZXJdPy5wbGF5aW5nID0gZmFsc2VcbiAgICAgICAgQG11c2ljID0gbnVsbFxuXG4gICAgIyMjKlxuICAgICogU3RvcHMgYWxsIG11c2ljL2F1ZGlvIGxheWVycy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHN0b3BBbGxNdXNpY1xuICAgICogQHBhcmFtIHtudW1iZXJ9IGZhZGVPdXRUaW1lIC0gVGhlIGZhZGUtb3V0IHRpbWUgaW4gZnJhbWVzLlxuICAgICMjI1xuICAgIHN0b3BBbGxNdXNpYzogKGZhZGVPdXRUaW1lKSAtPlxuICAgICAgICBmb3IgYnVmZmVyIGluIEBhdWRpb0J1ZmZlcnNcbiAgICAgICAgICAgIGlmIGJ1ZmZlcj9cbiAgICAgICAgICAgICAgICBidWZmZXIuc3RvcChmYWRlT3V0VGltZSlcbiAgICAgICAgICAgICAgICBidWZmZXIuY3VzdG9tRGF0YSA9IHsgaW5pdGlhbFZvbHVtZTogYnVmZmVyLmluaXRpYWxWb2x1bWUgfVxuICAgICAgICBAbXVzaWMgPSBudWxsXG5cblxuICAgIGRpc3Bvc2U6IChjb250ZXh0KSAtPlxuICAgICAgICBmb3IgcmVmZXJlbmNlIGluIEBzb3VuZFJlZmVyZW5jZXNcbiAgICAgICAgICAgIHJlZmVyZW5jZS5kaXNwb3NlKClcbiAgICAgICAgZGF0YSA9IGNvbnRleHQucmVzb3VyY2VzLnNlbGVjdCAocikgLT4gci5kYXRhXG4gICAgICAgIGZvciBidWZmZXIsIGxheWVyIGluIEBhdWRpb0J1ZmZlcnNCeUxheWVyXG4gICAgICAgICAgICBpZiBidWZmZXIgYW5kIGRhdGEuaW5kZXhPZihidWZmZXIpICE9IC0xXG4gICAgICAgICAgICAgICAgYnVmZmVyLmRpc3Bvc2UoKVxuXG4gICAgICAgICAgICAgICAgQGF1ZGlvQnVmZmVycy5yZW1vdmUoYnVmZmVyKVxuICAgICAgICAgICAgICAgIEBhdWRpb0J1ZmZlcnNCeUxheWVyW2xheWVyXSA9IG51bGxcbiAgICAgICAgICAgICAgICBAYXVkaW9MYXllcnNbbGF5ZXJdID0gbnVsbFxuXG4gICAgIyMjKlxuICAgICogRGlzcG9zZXMgYSBtdXNpYy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGRpc3Bvc2VNdXNpY1xuICAgICogQHBhcmFtIHtudW1iZXJ9IGxheWVyIC0gVGhlIGF1ZGlvIGxheWVyIG9mIHRoZSBtdXNpYyB0byBkaXNwb3NlLlxuICAgICMjI1xuICAgIGRpc3Bvc2VNdXNpYzogKGxheWVyKSAtPlxuICAgICAgICBsYXllciA9IGxheWVyID8gMFxuXG4gICAgICAgIEBzdG9wTXVzaWMoMCwgbGF5ZXIpXG4gICAgICAgICNAYXVkaW9CdWZmZXJzW2xheWVyXT8uZGlzcG9zZSgpXG4gICAgICAgIEBhdWRpb0J1ZmZlcnMucmVtb3ZlKEBhdWRpb0J1ZmZlcnNCeUxheWVyW2xheWVyXSlcbiAgICAgICAgQGF1ZGlvQnVmZmVyc0J5TGF5ZXJbbGF5ZXJdID0gbnVsbFxuICAgICAgICBAYXVkaW9MYXllcnNbbGF5ZXJdID0gbnVsbFxuXG53aW5kb3cuQXVkaW9NYW5hZ2VyID0gbmV3IEF1ZGlvTWFuYWdlcigpXG5ncy5BdWRpb01hbmFnZXIgPSBBdWRpb01hbmFnZXIiXX0=
//# sourceURL=AudioManager_72.js