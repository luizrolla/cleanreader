(function()
{
   "use strict";

   window.Util = {};



   ////////////////////////////////////////////////////////////////////////////

   Util.getDistanceBetweenElements = function( eElement1, eElement2 )
   {
      var getPosition = function( eElement )
      {
         var oResult = { "top"  : 0,
                         "left" : 0 };

         while( eElement )
         {
            oResult.top  += eElement.offsetTop;
            oResult.left += eElement.offsetLeft;

            eElement = eElement.offsetParent;
         }

         return oResult;
      };

      var oPosition1 = getPosition( eElement1 );
      var oPosition2 = getPosition( eElement2 );

      var y = oPosition1.top  - oPosition2.top;
      var x = oPosition1.left - oPosition2.left;

      return Math.sqrt( y * y + x * x );
   };



   ////////////////////////////////////////////////////////////////////////////

   Util.hasSubstringCaseInsensitive = function( string, substring )
   {
      var stringCopy = string.toLowerCase();
      var substringCopy = substring.toLowerCase();

      return ( stringCopy.indexOf( substringCopy ) !== -1 );
   }

   Util.parents = function(node) {
      var nodes = [node]
      for (; node; node = node.parentNode) {
        nodes.unshift(node)
      }
      return nodes
    }

    Util.commonAncestor = function(node1, node2) {
      console.log("commonAncestor");
      console.log(node1, node2);
      var parents1 = Util.parents(node1)
      var parents2 = Util.parents(node2)

      if (parents1[0] != parents2[0]) throw "No common ancestor!"

      for (var i = 0; i < parents1.length; i++) {
        if (parents1[i] != parents2[i]) return parents1[i - 1]
      }
    }

})();
