(function()
{
   "use strict";

   var _IGNORE_CLASS = "nbouibnonwenfofj_igore";

   var _ignoredTags = [
      "SCRIPT", "SVG", "IFRAME", "STYLE", "OBJECT", "FOOTER", "NAV", "ASIDE" ];



   ////////////////////////////////////////////////////////////////////////////
   // @brief   Singleton Class
   ////////////////////////////////////////////////////////////////////////////

   window.ArticleParser = function() {};   // Empty Constructor.



   ////////////////////////////////////////////////////////////////////////////

   ArticleParser.prototype.getArticle = function()
   {
      var $contentContainer = this._findContentContainer();

      this._revertModificationToExistingArticle();

      var title = this._getTitle( $contentContainer );

      return { "$title"   : title.text(),
               "$content" : this._getContent( $contentContainer, title ) };
   };



   ////////////////////////////////////////////////////////////////////////////

   ArticleParser.prototype._revertModificationToExistingArticle = function()
   {
      $("." + _IGNORE_CLASS).removeClass( _IGNORE_CLASS );
   };



   ////////////////////////////////////////////////////////////////////////////

   ArticleParser.prototype._findContainerWithTheMostParagraphs = function()
   {
      var $paragraphs = $("p");
      var listOfParagraphContainers = [];

      // Find the containers of all the paragraphs, and make sure they are
      // unique.

      $paragraphs.each( function( index, eParagraph )
      {
         if( !listOfParagraphContainers.some( function( $element ) {
                  return $element.is( eParagraph.parentNode ); } ) )
         {
            listOfParagraphContainers.push( $(eParagraph.parentNode) );
         }
      });

      // Sort the containers based on the number of paragraphs they have (in
      // descending order.)

      listOfParagraphContainers.sort( function( $container1, $container2 )
      {
         return $container2.children( "p" ).length -
                $container1.children( "p" ).length;
      });

      // Some news sites would use the <p> elements very liberally. So we need
      // to make sure the article container not only has the most paragraphs,
      // but also has the most text.

      var $containerWithTheMostParagraphs = $();
      for( var i = 0; i < listOfParagraphContainers.length; i++ )
      {
         var $container = listOfParagraphContainers[i];
         if(    $containerWithTheMostParagraphs.length === 0
             || $container.children("p").text().length > $containerWithTheMostParagraphs.children("p").text().length * 2 )
         {
            $containerWithTheMostParagraphs = $container;
         }
      }

      return $containerWithTheMostParagraphs;
   };



   ////////////////////////////////////////////////////////////////////////////

   ArticleParser.prototype._findContentContainer = function()
   {
      // Almost all the news sites use <p> for the article paragraphs. But
      // there are some unusual exceptions.
      // TODO: Find a generic way to parse this.

      /*var $contentContainer = $();

      var listOfUnusualContentContainerSelectors = [ ".post-body" ];
      listOfUnusualContentContainerSelectors.some( function( sSelector )
      {
         $contentContainer = $( sSelector );
         return ( $contentContainer.length > 0 );
      });

      if( $contentContainer.length === 0 )
      {
         $contentContainer = this._findContainerWithTheMostParagraphs();
      }

      if( $contentContainer.length === 0 )
      {
         // If an article is not found, then just display all the text.
         $contentContainer = $( "<div></div" );
         $contentContainer.html( document.body.innerText.replace( /\n/g, "<br/>") );
      }*/

      var n, textNodes = [];
      var walker = document.createTreeWalker(document.root, NodeFilter.SHOW_TEXT,
      {acceptNode: function(node) {
        var noOfWords = node.nodeValue.split(" ").length;
        return noOfWords > 5 ? NodeFilter.FILTER_ACCEPT; : NodeFilter.FILTER_REJECT;
      }});

      var possibleContentNodes = [];
      while(walker.nextNode()) {
        //textNodes.push(treeWalker.currentNode);
        var grandpa = textNodes.parentNode.parentNode;
        var found = false;
        var aNode = {};
        for (var i = 0; i < possibleContentNodes.length; i++) {
          aNode = possibleContentNodes[i];
          if (aNode.element == grandpa) {
            aNode.count++;
            found = true;
            break;
          }
        }
        if (!found) {
          aNode = {element: grandpa, count: 1};
          possibleContentNodes.push(aNode);
        }
      }

      possibleContentNodes.sort(function(a,b) {
        return a.count < b.count ? -1 : 1;
      });

      console.log(possibleContentNodes);

      return $contentContainer;
   };



   ////////////////////////////////////////////////////////////////////////////

   ArticleParser.prototype._shouldIgnoreElement = function( eElement )
   {

      var shouldIgnore = false;

      if (eElement.nodeType == Node.TEXT_NODE)
        return false;

      if( eElement )
      {
         var $element = $( eElement );
         try
         {
            shouldIgnore = (
                  eElement.nodeType != Node.ELEMENT_NODE //Not an element
               || $element.css( "float" ) === "left"
               || $element.css( "float" ) === "right"
               || $element.css( "position" ) === "absolute"
               || $element.hasClass( _IGNORE_CLASS ) //we intentionally ignored it
               || _ignoredTags.some( function( sTagName ) { return eElement.tagName.toUpperCase() === sTagName; } ) //it's tag is one that we've chosen to ignore
               || !$element.is(":visible")); //if the element is hidden

            //Let's check if the element has real content or just shit.
            if (!shouldIgnore) {
              //inline elements should stay if they have text
              if (window.getComputedStyle(eElement,null).display == "inline" && eElement.textContent.length > 0)
                return false;

              //Images and figures should remain, but to do that, their parents should too
              if ($element.find("img").length > 0 || $element.find("figure").length > 0 || eElement.tagName.toLowerCase() == "img" || eElement.tagName.toLowerCase() == "figure")
                return false;

              //if it is not and it has no h1, h2, h3 or p childs, ignore
              if (eElement.tagName.toLowerCase() != "h1" && eElement.tagName.toLowerCase() != "h2" &&
                  eElement.tagName.toLowerCase() != "h3" && eElement.tagName.toLowerCase() != "p" &&
                  $element.find("h1").length == 0 && $element.find("h2").length == 0 && $element.find("h3").length == 0 && $element.find("p").length == 0) {
                shouldIgnore = true;
              }
            }
         }
         catch( exception )
         {
            // jQuery will throw exception probably because it is not fully
            // tested in the Chrome extension environment.
         }
      }

      return shouldIgnore;
   };



   ////////////////////////////////////////////////////////////////////////////

   ArticleParser.prototype._getTitle = function( $contentContainer )
   {
      var $title = $();

      if( $contentContainer.length > 0 )
      {
      /*   var originalPrimaryTitle = this._getPrimaryTitle( $contentContainer );

         $title = $("<div></div>");
         $title.append( originalPrimaryTitle );*/
         return this._getPrimaryTitle( $contentContainer );
      }

      //return $title;*/


   };


   ////////////////////////////////////////////////////////////////////////////

   ArticleParser.prototype._getHeadingElementClosestToContainer = function( eContentContainer )
   {
      // Find the heading elment that's closest to the content container.

      var $title = $();

      var listOfHeadingElementTags = [ "h1", "h2", "h3" ];
      var listOfHeadingElements = [];

      for( var i = 0;
              i < listOfHeadingElementTags.length
           && listOfHeadingElements.length === 0;
           i++ )
      {
         listOfHeadingElements = $.makeArray( $( listOfHeadingElementTags[i] ) );
      }

      listOfHeadingElements.sort( function( eElement1, eElement2 )
      {
         var iDistance1 = Util.getDistanceBetweenElements( eElement1, eContentContainer );
         var iDistance2 = Util.getDistanceBetweenElements( eElement2, eContentContainer );

         return iDistance1 - iDistance2;
      });

      var eHeadingElementClosestToContent = listOfHeadingElements[0];
      if( eHeadingElementClosestToContent )
      {
         $title = $( eHeadingElementClosestToContent );
         // Prevent dupolicate titles from appearing in the content.
         $title.addClass( _IGNORE_CLASS );
      }

      return $title;
   };



   ////////////////////////////////////////////////////////////////////////////

   ArticleParser.prototype._getPrimaryTitle = function( $contentContainer )
   {
      var $title = $();
      var eContentContainer = $contentContainer[0];

      if( eContentContainer )
      {
         // Most news sites use heading elements such h1, h2, etc., for the
         // article titles. But there are some unusual exceptions.
         // TODO: Find a generic way to parse this.

         var listOfUnusualPrimaryTitleSelectors = [ ".post-title" ];
         listOfUnusualPrimaryTitleSelectors.some( function( sSelector )
         {
            $title = $( sSelector );
            return ( $title.length > 0 );
         });

         if( $title.length === 0 )
         {
            $title = this._getHeadingElementClosestToContainer( eContentContainer );
         }

         // For styling purposes, make sure the title is a <h1> element.
         /*if(    $title.length > 0
             && $title[0].tagName !== "H1" )
         {
            var $h1 = $("<h1></h1>");
            $h1.html( $title.html() );
            $title = $h1;
         }*/
      }

      //return $title.text();
      return $title;
   };

   ////////////////////////////////////////////////////////////////////////////

   ArticleParser.prototype._getContent = function( $contentContainer, $title )
   {
     //Get the first ancestor of the title and content to get the stuff between the two also.
     /*var realContainer = Util.commonAncestor($contentContainer[0], $title[0]);

     if (realContainer) {
       $contentContainer = $(realContainer);
     }*/

     //this._removeInvisibles($contentContainer);

     //Clone the container so we don't mess with the real page
     var $containerClone = $contentContainer.clone();

     var containerTraversal = [$containerClone[0]];
     var realTraversal = [$contentContainer[0]];

     while(containerTraversal.length > 0) {

       var element = containerTraversal.shift();
       var realElement = realTraversal.shift();

       //Should be ignored?
       if (this._shouldIgnoreElement(realElement)) {
         element.remove();
       } else {
         //If it is not the first pass
         if (element != $containerClone[0]) {
           //Remove class, id and attributes that change the style
           this._sanitizeElement(element);
         }

         if (element.childNodes && element.childNodes.length > 0 &&
            realElement.childNodes && element.childNodes.length == realElement.childNodes.length) {
           for (var i = 0; i < element.childNodes.length; i++) {
             containerTraversal.push(element.childNodes[i]);
             realTraversal.push(realElement.childNodes[i]);
           }
         }
       }
     }

     var $result = $("<div></div>");
     $result[0].appendChild( $containerClone[0] );

     return $result;

   };



   ////////////////////////////////////////////////////////////////////////////

   ArticleParser.prototype._restoreSeparatedParagraphs = function( $contentContainer,
                                                                   $contentContainerClone )
   {
      // Handle the special cases where the article content is split into
      // two separate containers.

      var isSplitIntoTwoContainers = false;
      var listOfContainers = [ $contentContainer, $contentContainer.parent() ];

      for( var i = 0; i < listOfContainers.length && !isSplitIntoTwoContainers; i++ )
      {
         var $container = listOfContainers[i];
         var sClassAttr = $container.attr( "class" );
         var listOfClassNames = sClassAttr ? sClassAttr.split( " " ) : [];

         for( var j = 0; j < listOfClassNames.length && !isSplitIntoTwoContainers; j++ )
         {
            var sClassName = listOfClassNames[j];

            if(    Util.hasSubstringCaseInsensitive( sClassName, "article" )
                && Util.hasSubstringCaseInsensitive( sClassName, "body" ) )
            {
               var $splitContentContainer = $container.siblings( "." + sClassName );
               var $separatedParagraphs = $splitContentContainer.find( "p" );

               if(    $splitContentContainer.length === 1
                   && $separatedParagraphs.length > 0 )
               {
                  isSplitIntoTwoContainers = true;

                  $separatedParagraphs.each( function( iIndex, eParagraph )
                  {
                     var $clonedParagraph = $(eParagraph).clone();
                     $contentContainerClone.prepend( $clonedParagraph );

                     // Need to make sure the original content container has
                     // the same number of elements as the clone.
                     var $clonedParagraph2 = $(eParagraph).clone();
                     $clonedParagraph2.css( "display", "none" );
                     $contentContainer.prepend( $clonedParagraph2 );
                  });
               }
            }
         }
      }
   };



   ////////////////////////////////////////////////////////////////////////////

   ArticleParser.prototype._sanitizeElement = function( eElement )
   {
      if( eElement )
      {
         eElement.id        = "";
         eElement.className = "";

         if( eElement.removeAttribute )
         {
            eElement.removeAttribute( "style" );
            eElement.removeAttribute( "width" );
            eElement.removeAttribute( "height" );
         }
      }
   };



   ////////////////////////////////////////////////////////////////////////////

   ArticleParser.prototype._sanitizeElementAndDesendants = function( element )
   {
      var eElement = ( element instanceof $ ) ? element[0] : element;

      if( eElement )
      {
         var listOfElements = [ eElement ];

         while( listOfElements.length > 0 )
         {
            var e = listOfElements.shift();

            this._sanitizeElement( e );

            for( var i = 0; i < e.childNodes.length; i++ )
            {
               listOfElements.push( e.childNodes[i] );
            }
         }
      }
   };




})();
