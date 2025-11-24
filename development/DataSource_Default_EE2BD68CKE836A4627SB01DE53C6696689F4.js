ui.UiFactory.dataSources["default"] = function() {
  return {
    "database": RecordManager,
    "settings": GameManager.settings,
    "tempSettings": GameManager.tempSettings,
    "globalData": GameManager.globalData,
    "backlog": GameManager.backlog,
    "saveGameSlots": GameManager.saveGameSlots,
    "scene": GameManager.scene,
    "languages": LanguageManager.languages,
    "chapters": GameManager.chapters.where(function(c) {
      return RecordManager.cgGalleryArray.first(function(cg) {
        var ref;
        return ((ref = cg.relationData) != null ? ref.chapter.uid : void 0) === c.uid;
      }) !== null;
    }),
    "textInputPages": ui.Helper.generateTextInputPages(),
    "cgGalleryByChapter": RecordManager.cgGalleryArray.groupBy(function(x) {
      var ref;
      return (x != null ? (ref = x.relationData) != null ? ref.chapter.uid : void 0 : void 0) || "";
    }).toDictionary((function(x) {
      var ref, ref1;
      return (x != null ? (ref = x[0]) != null ? (ref1 = ref.relationData) != null ? ref1.chapter.uid : void 0 : void 0 : void 0) || "";
    }), (function(x) {
      return x;
    }))
  };
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLEVBQUUsQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFDLE9BQUQsRUFBeEIsR0FBbUMsU0FBQTtTQUFHO0lBQ2xDLFVBQUEsRUFBWSxhQURzQjtJQUVsQyxVQUFBLEVBQVksV0FBVyxDQUFDLFFBRlU7SUFHbEMsY0FBQSxFQUFnQixXQUFXLENBQUMsWUFITTtJQUlsQyxZQUFBLEVBQWMsV0FBVyxDQUFDLFVBSlE7SUFLbEMsU0FBQSxFQUFXLFdBQVcsQ0FBQyxPQUxXO0lBTWxDLGVBQUEsRUFBaUIsV0FBVyxDQUFDLGFBTks7SUFPbEMsT0FBQSxFQUFTLFdBQVcsQ0FBQyxLQVBhO0lBUWxDLFdBQUEsRUFBYSxlQUFlLENBQUMsU0FSSztJQVNsQyxVQUFBLEVBQVksV0FBVyxDQUFDLFFBQVEsQ0FBQyxLQUFyQixDQUEyQixTQUFDLENBQUQ7YUFBTyxhQUFhLENBQUMsY0FBYyxDQUFDLEtBQTdCLENBQW1DLFNBQUMsRUFBRDtBQUFRLFlBQUE7cURBQWUsQ0FBRSxPQUFPLENBQUMsYUFBekIsS0FBZ0MsQ0FBQyxDQUFDO01BQTFDLENBQW5DLENBQUEsS0FBcUY7SUFBNUYsQ0FBM0IsQ0FUc0I7SUFVbEMsZ0JBQUEsRUFBa0IsRUFBRSxDQUFDLE1BQU0sQ0FBQyxzQkFBVixDQUFBLENBVmdCO0lBV2xDLG9CQUFBLEVBQXNCLGFBQWEsQ0FBQyxjQUFjLENBQUMsT0FBN0IsQ0FBc0MsU0FBQyxDQUFEO0FBQU8sVUFBQTs4REFBZSxDQUFFLE9BQU8sQ0FBQyxzQkFBekIsSUFBZ0M7SUFBdkMsQ0FBdEMsQ0FBaUYsQ0FBQyxZQUFsRixDQUFnRyxDQUFDLFNBQUMsQ0FBRDtBQUFPLFVBQUE7eUZBQW1CLENBQUUsT0FBTyxDQUFDLCtCQUE3QixJQUFvQztJQUEzQyxDQUFELENBQWhHLEVBQWlKLENBQUMsU0FBQyxDQUFEO2FBQU87SUFBUCxDQUFELENBQWpKLENBWFk7O0FBQUgiLCJzb3VyY2VzQ29udGVudCI6WyJ1aS5VaUZhY3RvcnkuZGF0YVNvdXJjZXMuZGVmYXVsdCA9IC0+IHtcbiAgICBcImRhdGFiYXNlXCI6IFJlY29yZE1hbmFnZXIsXG4gICAgXCJzZXR0aW5nc1wiOiBHYW1lTWFuYWdlci5zZXR0aW5ncyxcbiAgICBcInRlbXBTZXR0aW5nc1wiOiBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3MsXG4gICAgXCJnbG9iYWxEYXRhXCI6IEdhbWVNYW5hZ2VyLmdsb2JhbERhdGEsXG4gICAgXCJiYWNrbG9nXCI6IEdhbWVNYW5hZ2VyLmJhY2tsb2csXG4gICAgXCJzYXZlR2FtZVNsb3RzXCI6IEdhbWVNYW5hZ2VyLnNhdmVHYW1lU2xvdHMsXG4gICAgXCJzY2VuZVwiOiBHYW1lTWFuYWdlci5zY2VuZSxcbiAgICBcImxhbmd1YWdlc1wiOiBMYW5ndWFnZU1hbmFnZXIubGFuZ3VhZ2VzLFxuICAgIFwiY2hhcHRlcnNcIjogR2FtZU1hbmFnZXIuY2hhcHRlcnMud2hlcmUoKGMpIC0+IFJlY29yZE1hbmFnZXIuY2dHYWxsZXJ5QXJyYXkuZmlyc3QoKGNnKSAtPiBjZy5yZWxhdGlvbkRhdGE/LmNoYXB0ZXIudWlkID09IGMudWlkKSAhPSBudWxsKSxcbiAgICBcInRleHRJbnB1dFBhZ2VzXCI6IHVpLkhlbHBlci5nZW5lcmF0ZVRleHRJbnB1dFBhZ2VzKCksXG4gICAgXCJjZ0dhbGxlcnlCeUNoYXB0ZXJcIjogUmVjb3JkTWFuYWdlci5jZ0dhbGxlcnlBcnJheS5ncm91cEJ5KCAoeCkgLT4geD8ucmVsYXRpb25EYXRhPy5jaGFwdGVyLnVpZCB8fCBcIlwiICkudG9EaWN0aW9uYXJ5KCAoKHgpIC0+IHg/WzBdPy5yZWxhdGlvbkRhdGE/LmNoYXB0ZXIudWlkIHx8IFwiXCIpLCAoKHgpIC0+IHgpIClcbn0iXX0=
//# sourceURL=DataSource_Default_11.js