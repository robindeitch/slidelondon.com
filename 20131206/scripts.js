/* + - + - + - + - + - + - + - + */
/*                               */
/*      (c) Slide Ltd 2013       */
/*    http://slidelondon.com     */
/*                               */
/* + - + - + - + - + - + - + - + */
var hexDigits = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f");

// Open links in new window
$('a').click(function () {
    $(this).attr('target', '_blank');
});

// Add in the fb like button
function AddLikeButton() {
    //var likebuttonhref = "http://slidelondon.com";
    var likebuttonhref = "https://www.facebook.com/slideltd";
	$("#likebutton").html('<fb:like layout="box_count" show_faces="false" width="400" href="' + likebuttonhref + '"></fb:like>');
	FB.XFBML.parse(document.getElementById('likebutton'));
}

// From http://aboutcode.net/2013/01/09/load-images-with-jquery-deferred.html
$.loadImage = function (url) {
    // Define a "worker" function that should eventually resolve or reject the deferred object.
    var loadImage = function (deferred) {
        var image = new Image();

        // Set up event handlers to know when the image has loaded
        // or fails to load due to an error or abort.
        image.onload = loaded;
        image.onerror = errored; // URL returns 404, etc
        image.onabort = errored; // IE may call this if user clicks "Stop"

        // Setting the src property begins loading the image.
        image.src = url;

        function loaded() {
            unbindEvents();
            // Calling resolve means the image loaded sucessfully and is ready to use.
            deferred.resolve(image);
        }
        function errored() {
            unbindEvents();
            // Calling reject means we failed to load the image (e.g. 404, server offline, etc).
            deferred.reject(image);
        }
        function unbindEvents() {
            // Ensures the event callbacks only get called once.
            image.onload = null;
            image.onerror = null;
            image.onabort = null;
        }
    };

    // Create the deferred object that will contain the loaded image.
    // We don't want callers to have access to the resolve() and reject() methods,
    // so convert to "read-only" by calling `promise()`.
    return $.Deferred(loadImage).promise();
};

ScaleEnum = {
		Unknown : 0,
		WindowThinnerThanImage : 1,
		WindowShorterThanImage : 2
};

// -------------------------------------------------------
// Background class
// -------------------------------------------------------
var Background = function(Selector) {
	this.ParentWindow = $(window); // Browser window object
	this.BackgroundDiv = $(Selector); // Div containing the background image
	this.BackgroundImage = null;
	this.BackgroundImageWidth = -1;
	this.BackgroundImageHeight = -1;
	this.BackgroundImageAspect = -1;
	this.PreviousState = ScaleEnum.Unknown;

	this.BackgroundImage = $(this.BackgroundDiv).find('img');
	this.SetImageInfoFirst(480, 530);

	return 1;
};
Background.prototype.SetImage = function(theImage) {
	this.BackgroundImage.remove(); // Remove the old image
	this.BackgroundDiv.append(theImage.image); // Add this new one
	this.BackgroundImage = this.BackgroundDiv.find('img'); // Save a reference to the new one
	this.SetImageInfo(theImage);
	this.PreviousState = ScaleEnum.Unknown;
	this.Resize();
};
Background.prototype.SetImageInfo = function (theImage) {
	var tempImage = new Image(); // Make a copy of the image to access native size
	tempImage.src = this.BackgroundImage.attr("src");
	this.BackgroundImageWidth = tempImage.width;
	this.BackgroundImageHeight = tempImage.height;
	this.BackgroundImageAspect = this.BackgroundImageWidth / this.BackgroundImageHeight;
	this.IdealX = theImage.idealX;
	this.IdealY = theImage.idealY;
	tempImage = null;
};
Background.prototype.SetImageInfoFirst = function (idealX, idealY) {
    var tempImage = new Image(); // Make a copy of the image to access native size
    tempImage.src = this.BackgroundImage.attr("src");
    this.BackgroundImageWidth = tempImage.width;
    this.BackgroundImageHeight = tempImage.height;
    this.BackgroundImageAspect = this.BackgroundImageWidth / this.BackgroundImageHeight;
    this.IdealX = idealX;
    this.IdealY = idealY;
    tempImage = null;
};
Background.prototype.Resize = function () {
	// Get the parent window dimensions and calculate aspect
	var windowWidth = this.ParentWindow.width();
	var windowHeight = this.ParentWindow.height();
	var windowAspect = windowWidth / windowHeight;

	// Is the window thinner or shorter than the image?
	var thisState = ScaleEnum.Unknown;
	if (windowAspect < this.BackgroundImageAspect)
	    thisState = ScaleEnum.WindowThinnerThanImage;
	else
	    thisState = ScaleEnum.WindowShorterThanImage;

	// If the state has changed, add/remove the appropriate classes to keep
	// the image scaled 100% in the right direction
	if (this.PreviousState !== thisState) {

		this.BackgroundImage.removeClass();

		if (thisState === ScaleEnum.WindowThinnerThanImage) {
			this.BackgroundImage.addClass('bgheight');
			this.BackgroundImage.css("top", "0px");
		}
		else {
			this.BackgroundImage.addClass('bgwidth');
			this.BackgroundImage.css("left", "0px");
		}

		this.PreviousState = thisState;
	}

	// Regardless of whether the state has changed, update the left or top offsets
	// to keep the image as close to its ideal position as possible
	if (thisState === ScaleEnum.WindowThinnerThanImage) {
		// Adjust image X position
		var imageScaledWidth = windowHeight * this.BackgroundImageAspect;

		var idealXImage = this.IdealX * (imageScaledWidth / this.BackgroundImageWidth);
		var idealXWindow = 0.3 * windowWidth;

		var idealXOffset = idealXImage - idealXWindow;
		var maxXOffset = imageScaledWidth - windowWidth;
		if(idealXOffset > maxXOffset)
			idealXOffset = maxXOffset;

		this.BackgroundImage.css("left", "-" + idealXOffset + "px");
	}

	if (thisState === ScaleEnum.WindowShorterThanImage) {
		// Adjust image Y position
		var imageScaledHeight = windowWidth / this.BackgroundImageAspect;
			
		var idealYImage = this.IdealY * (imageScaledHeight / this.BackgroundImageHeight);
		var idealYWindow = 0.3 * windowHeight;

		var idealYOffset = idealYImage - idealYWindow;
		var maxYOffset = imageScaledHeight - windowHeight;
		if(idealYOffset > maxYOffset)
			idealYOffset = maxYOffset;

		this.BackgroundImage.css("top", "-" + idealYOffset + "px");
	}
};


// -------------------------------------------------------
// Panel class
// -------------------------------------------------------
var Panel = function (TextSelector, HeadlineSelector, FirstLineSelector) {
	this.Text = $(TextSelector);
	this.Headline = $(HeadlineSelector);
	this.LineA = $(FirstLineSelector);
	this.Header = $("#header");
	this.HeaderA = $(".headera");
	this.ListMain = $("#listmain");
	this.TextP = $("#text p");
	this.LikeButton = $("#likebutton");
	this.LogoBox = $("div.logo");
	this.LogoBoxImg = $("div.logo img");

	// Calculate scrollbar width
	// From http://chris-spittles.co.uk/jquery-calculate-scrollbar-width/
	var $inner = jQuery('<div style="width:100%; height:200px;">test</div>');
    var $outer = jQuery('<div style="width:200px; height:150px; position:absolute; top:0; left:0; visibility:hidden; overflow:hidden;"></div>').append($inner);
    var inner = $inner[0];
    var outer = $outer[0];
    jQuery('body').append(outer);
    var width1 = inner.offsetWidth;
    $outer.css('overflow', 'scroll');
    var width2 = outer.clientWidth;
    $outer.remove();
    this.ScrollbarWidth = width1 - width2;

	// Calculate total headline padding
	var paddingLeft = parseInt(this.Headline.css("margin-left"), 10);
	var paddingRight = parseInt(this.Headline.css("margin-right"), 10);
	this.Padding = (paddingLeft + paddingRight);

	this.Resize();

	return 1;
};
Panel.prototype.Resize = function() {
	// First, force a redraw
	var test = document.getElementById("backg");
	test.style.display = "none";
	var redrawFix = test.offsetHeight;
	test.style.display = "block";

    // The panel width is proportional to the window width and whether or not scrollbars are showing,
	// so we need to calculate its width each time to know how big to make the headline text
	var availableWidth = this.Text.width() - this.ScrollbarWidth - this.Padding;

	// Resize the headline to 1em, then measure the width of the first line
	this.Headline.css("font-size", "1em");
	var lineAWidth = this.LineA.width();
	
	// The ratio of available width to actual width can be used as the em font-size (scaled down
	// a tiny bit to account for the italic font)
	var mult = 0.98 * availableWidth / lineAWidth;
	this.Headline.css("font-size", "" + mult + "em");
	this.Headline.css("line-height", "0.9");

    // Scale down the first line even more, again cos of the italic font
	this.LineA.css("font-size", "1.175em");

    // Do the same for the header text
	this.Header.css("font-size", "1em");
	var headerAWidth = this.HeaderA.width();
	mult = 0.98 * availableWidth / headerAWidth;
	this.Header.css("font-size", "" + mult + "em");

    // Finally, do something responsive to the rest of the text
	if (window.innerWidth > 645) {
	    this.ListMain.css("font-size", "1.1em");
	    this.ListMain.css("margin", "4px 30px 10px 30px");
	    this.TextP.css("font-size", "1em");
	    this.TextP.css("padding", "10px 30px 10px 30px");
	    this.LikeButton.css("padding", "0px 30px 6px 30px");
	    this.LogoBox.css("width", "150px");
	    this.LogoBox.css("height", "130px");
	    this.LogoBoxImg.css("width", "150px");
	    this.LogoBoxImg.css("height", "130px");
    }
	else if (window.innerWidth > 350) {
	    this.ListMain.css("font-size", "0.75em");
	    this.ListMain.css("margin", "4px 10px 10px 10px");
	    this.TextP.css("font-size", "0.75em");
	    this.TextP.css("padding", "4px 10px 10px 10px");
	    this.LikeButton.css("padding", "0px 10px 6px 10px");
	    this.LogoBox.css("width", "90px");
	    this.LogoBox.css("height", "78px");
	    this.LogoBoxImg.css("width", "90px");
	    this.LogoBoxImg.css("height", "78px");
	}
	else {
	    this.ListMain.css("font-size", "0.75em");
	    this.ListMain.css("margin", "4px 10px 10px 10px");
	    this.TextP.css("font-size", "0.75em");
	    this.TextP.css("padding", "4px 10px 10px 10px");
	    this.LikeButton.css("padding", "0px 10px 6px 10px");
	    this.LogoBox.css("width", "60px");
	    this.LogoBox.css("height", "52px");
	    this.LogoBoxImg.css("width", "60px");
	    this.LogoBoxImg.css("height", "52px");
	}
};


var ColourToString = function (Red, Green, Blue) {

    var strR = ((Red & 0xf0) >> 4).toString(16) + (Red & 0x0f).toString(16);
    var strG = ((Green & 0xf0) >> 4).toString(16) + (Green & 0x0f).toString(16);
    var strB = ((Blue & 0xf0) >> 4).toString(16) + (Blue & 0x0f).toString(16);

    return "#" + strR + strG + strB;
}


// -------------------------------------------------------
// Checkerboard class
// -------------------------------------------------------
var Checkerboard = function(SelectorOuter, SelectorInner) {
	this.ID = SelectorOuter;
	this.IDInner = SelectorInner;
	this.ParentWindow = $(window); // Browser window object
	this.CellMaxSize = 90; // Maximum pixel width/height of a cell
	this.PreviousRowCount = -1;
	this.PreviousColCount = -1;
	this.CellCount = -1;
	this.CheckerboardElements = [];
	this.CheckerboardData = [];
	this.CycleOffset = 0;
	this.CycleOffsetPrevious = 0;
	this.FrameInterval = 33;
	this.CycleInterval = 4000;
	this.FirstCycleInterval = 2000;
	this.TransitionDuration = 1750;
	this.Images = null;
	this.ImageCounter = -1;
	this.BackgroundObject = null;
	this.TimeOut = null;
	this.First = true;
};
Checkerboard.prototype.Resize = function() {
	// How many rows and columns do we need?
	var numCols = Math.floor(this.ParentWindow.width() / this.CellMaxSize) + 1;
	var numRows = Math.floor(this.ParentWindow.height() / this.CellMaxSize) + 1;

	// Do we need to recreate the checkerboard table element?
	if((numCols !== this.PreviousColCount) || (numRows !== this.PreviousRowCount))
	{
	    var x, y, cellNumericIndex, cellID;

		// Create the html
		var tableInner = '';
		for (y=0; y<numRows; y++)
		{
			tableInner += '<tr>';
			for (x=0; x<numCols; x++)
			{
				// We need a unique index for each cell
				cellNumericIndex = (y*1000)+x;
				cellID = 'cell' + cellNumericIndex;

				tableInner += '<td id="' + cellID + '">&nbsp;</td>';
			}
			tableInner += '</tr>';
		}

		// Replace the existing checkerboard in the DOM
		var tableHeader = '<table id="checkerboard"><tbody id="checkerboardInner">';
		var tableFooter = '</tbody></table>\n';
		$(this.ID).replaceWith(tableHeader + tableInner + tableFooter);

		// Calculate an offset value for each cell, so we can colour/animate/whatever
		// in an interesting pattern later on
		var idealX = Math.floor(numCols * 0.3);
		var idealY = Math.floor(numRows * 0.3);
		var maxXDist = numCols - 1 - idealX;
		var maxYDist = numRows - 1 - idealY;
		var maxDist = Math.sqrt(maxXDist*maxXDist + maxYDist*maxYDist);

		for (y=0; y<numRows; y++)
		{
			for (x=0; x<numCols; x++)
			{
				// Calculate a normalised falloff from the ideal point to here
				var offX = x - idealX;
				var offY = y - idealY;
				var dist = Math.sqrt(offX*offX + offY*offY);
				var distNormalised = dist/maxDist;

				// Store the element and its offset in the checkerboard arrays
				cellNumericIndex = (y*1000)+x;
				cellID = '#cell' + cellNumericIndex;
				this.CheckerboardElements[cellNumericIndex] = $(cellID);
				//this.CheckerboardData[cellNumericIndex] = distNormalised;

				var rand = Math.random();
				this.CheckerboardData[cellNumericIndex] = rand * 0.8;
			}
		}

		// Keep track of the new row/column counts and total number of cells
		this.PreviousColCount = numCols;
		this.PreviousRowCount = numRows;
		this.CellCount = numCols * numRows;
	}
};
Checkerboard.prototype.Cycle = function () {

    var _this = this;

    if (this.TimeOut != null)
        clearTimeout(this.TimeOut);

    // If it's the first run, wait for a cycle duration
    if (this.First == true) {
        this.First = false;

        this.TimeOut = setTimeout(function () {
            _this.Cycle();
        }, this.FirstCycleInterval);

        return;
    }

    var allDone = false;

    // Take the tbody out of the DOM while we update it
    var tbl = $(this.ID);
    var tblInner = $(this.IDInner);
    tblInner.remove();

    // Get the current width and height of the checkerboard cells
    var numRows = this.PreviousRowCount;
    var numCols = this.PreviousColCount;

    // Update the timed offset
    this.CycleOffset += this.FrameInterval / this.TransitionDuration;
    if (this.CycleOffset > 1.0) {
        this.CycleOffset = 0.0;
        allDone = true;
    }

    // Go through every cell
    for (var y = 0; y < numRows; y++) {
        for (var x = 0; x < numCols; x++) {
            // Get this cell's ID
            var cellNumericIndex = (y * 1000) + x;

            // Get the stored offset
            var cellOffsetRaw = this.CheckerboardData[cellNumericIndex];
            var cellOffset = Math.abs(cellOffsetRaw);

            // Map normalised phase to timeline
            var baseTimeline = this.CycleOffset * 3;

            // Get current cell's position on timeline
            var cellTimeline = baseTimeline + cellOffset;

            // Calculate wipe texture offset
            var isOn = false;
            if (cellTimeline < 1) {
                isOn = false;
            }
            else if (cellTimeline < 2) {
                isOn = true;
            }
            else if (cellTimeline < 3) {
                isOn = false;
            }

            var thisCell = this.CheckerboardElements[cellNumericIndex];

            // Are we changing from transparent to solid?
            if (isOn && cellOffsetRaw > 0) {

                // Lerp between two colours using the per-cell random value
                var lowR = 38;
                var lowG = 43;
                var lowB = 3;
                var highR = 74;
                var highG = 84;
                var highB = 6;
                var thisR = lowR + ((highR - lowR) * cellOffset);
                var thisG = lowG + ((highG - lowG) * cellOffset);
                var thisB = lowB + ((highB - lowB) * cellOffset);
                var thisCol = ColourToString(thisR, thisG, thisB);

                thisCell[0].style.backgroundColor = thisCol;
                this.CheckerboardData[cellNumericIndex] *= -1;
            }

            // Are we changing from solid to transparent?
            if (!isOn && cellOffsetRaw < 0) {
                thisCell[0].style.backgroundColor = "transparent";
                this.CheckerboardData[cellNumericIndex] *= -1;
            }
        }
    }

    // Add the tweaked tbody back into the DOM
    tbl.append(tblInner);

    // If we're fully wiped in...
    var blendIn = 1.0 / 3;
    if ((this.CycleOffset >= blendIn) && (this.CycleOffsetPrevious < blendIn)) {
        // ...swap the image
        var thisImage = this.Images[this.ImageCounter];
        this.BackgroundObject.SetImage(thisImage);

        // Increment the counter and wrap if need be
        this.ImageCounter++;
        if (this.ImageCounter === this.Images.length)
            this.ImageCounter = 0;
    }

    // Save the current phase so we can compare against it next time
    this.CycleOffsetPrevious = this.CycleOffset;

    // If we've done the whole transition, wait for the full cycle interval (ie 3secs), otherwise
    // trigger again as close to the frame interval (ie 33ms) as possible
    if (allDone) {
        this.TimeOut = setTimeout(function () {
            _this.Cycle();
        }, this.CycleInterval);
    }
    else {
        this.TimeOut = setTimeout(function () {
            _this.Cycle();
        }, this.FrameInterval);
    }
};
Checkerboard.prototype.InitCycle = function(TransitionDuration, CycleInterval, FirstCycleInterval, Images, BackgroundObject) {
    this.CycleInterval = CycleInterval;
    this.FirstCycleInterval = FirstCycleInterval;
	this.TransitionDuration = TransitionDuration;
	this.Images = Images;
	this.ImageCounter = 0;
	this.BackgroundObject = BackgroundObject;
	this.Cycle();
};




$(window).load(function() {    
	// Instantiate some objects
	var thisBackground = new Background('#backg');
	var thisPanel = new Panel('#text', '#headline', '.lineA');
	var thisCheckerboard = new Checkerboard('#checkerboard', '#checkerboardInner');

    // Setup the resize handler, which deals with positioning and styles of the background
    // image, along with recreating the checkerboard if neccessary
	$(window).resize(function() {
		thisBackground.Resize();
		thisPanel.Resize();
		thisCheckerboard.Resize();
	}).trigger("resize");


    // Load the images asyncronously, then start the transition effect
	var bgImageObjects = [];
	$.when(
        $.loadImage("20131206/02hercloseup.jpg"),
        $.loadImage("20131206/03himportrait.jpg"),
        $.loadImage("20131206/04herportrait.jpg"),
        $.loadImage("20131206/06himlightingtests.jpg"),
        $.loadImage("20131206/01himcloseup.jpg")
        ).done(function (i0, i1, i2, i3, i4) {
            bgImageObjects[0] = { image: i0, idealX: 500, idealY: 540 }; // 02hercloseup 500/540
            bgImageObjects[1] = { image: i1, idealX: 240, idealY: 410 }; // 03himportrait 240/410
            bgImageObjects[2] = { image: i2, idealX: 245, idealY: 165 }; // 04herportrait 245/165
            bgImageObjects[3] = { image: i3, idealX: 175, idealY: 190 }; // 06himlightingtests 175/190
            bgImageObjects[4] = { image: i4, idealX: 480, idealY: 530 }; // 01himcloseup 480/530

            // Start effect, passing in the transition
            // time and delay between cycles
            thisCheckerboard.InitCycle(1000, 3000, 1500, bgImageObjects, thisBackground);
        });
});
