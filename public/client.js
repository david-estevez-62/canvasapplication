var smallerScreenDimen,
	leftButtonDown,
	lastWidthDimen,
	scaleClose,
	linkCol = [];
	



$("#nav span").on("click", function(){
	// Check to see if the span that was clicked does not currently have the active class in #nav 
	// otherwise do nothing because that is already the current state
	if(!($(this).hasClass("active"))){

		$(this).siblings().removeClass("active");
		$(this).addClass("active");

		if($(this)[0] === $("#nav span")[0]){
			// If the element with id draftLayer (the editable layer) has any children elements, then 
			// trap user and tell them they have unsaved work and ask if they wish to stop the action
			if($("#draftLayer")[0].firstChild && confirm("You have unsaved work. Click the Ok button to keep your work.\n" + 
														 "Or cancel to continue anyway and lose your unsaved work")){
				$(this).siblings().addClass("active");
				$(this).removeClass("active");
				return;
			}



			location.reload(true);


			// Request new pictures from backend to add to the canvas
			// getNewCanvas()

		}else{

			// Re-create the editable div and show toolbar because the span corresponding with the 
			// edit state was clicked
			$("#backSetting").after("<div id='draftLayer'>");

			$("#toolBar").removeClass("hide");


			// Set the dimensions of the newly created div to be the same dimensions of the #backSetting 
			// div that holds the static canvas so it is essentially an identical div stacked above
			$("#draftLayer").css({ width: $("#backSetting").width(), height: $("#backSetting").height() });

			
			// Add the listeners, including the mousemove and drag listeners on the edit div itself
			addEditStateEvents();
		 	$(document).on("mousedown", function(event){
		 		if(event.which === 1){
		 			leftButtonDown = true;
		 		}else if(event.button === 0){
		 			leftButtonDown = true;
		 		}
			});
			$(document).on("mouseup", function(event){
			    	if(event.which === 1){
		 			leftButtonDown = false;
		 		}else if(event.button === 0){
		 			leftButtonDown = false;
		 		}
			});

		
		}	
	}


});



$("#loginBlock").delegate("span", "click", function(){
	// Either of two elements will come back from the selector as being spans in the loginBlock we only want 
	// the span to be the opposite of the one that currently has the active class or else do nothing because 
	// that means the span that was clicked is the one that corresponds to the already the current state
	if(!($(this).hasClass("active"))) {
		// switch the active class to the opposite span within the loginBlock
		$("#loginBlock .active").removeClass("active");
		$(this).addClass("active");

	}

});




$("#toolBar #refreshBtn").on("click", function(){
	var frameLayer = document.getElementById("draftLayer");
	// If the element with id draftLayer (the editable layer) has any children elements, then trap user and 
	// inform that there is unsaved work and the work is at risk of being lost if they still wish to refresh anyway
	if(frameLayer.firstChild && confirm("Are you sure you wish to refresh, you have unsaved work. Click Ok to refresh anyway")){
		// remove the editable div and add it right back instead of looping through and removing all child elements
		frameLayer.parentNode.removeChild(frameLayer);
		$("#backSetting").after("<div id='draftLayer'>");
		$("#draftLayer").css({ 
								width: $("#backSetting").width(),
								height: $("#backSetting").height()
							});
		addEditStateEvents();
	}
})

$("#toolBar #backgroundTog").on("click", function(){
	// Toggle between shwoing and hiding of background set of canvas images
	if($(this)[0].checked){
		$("#backSetting a").hide();
	}else{
		$("#backSetting a").show();
	}
});

$("#toolBar").delegate("#addTextBox", "keyup", function(event){

	if(this.value.indexOf(".") !== -1){
		this.style.border = "2px solid limegreen";
	}else{
		this.style.border = "";
	}
});


$("#toolBar").delegate("#addTextBox", "dragstart", function(event){
	var link = this.value.trim()

	if(link.indexOf(".") !== -1) {
		if(link.indexOf("http") === -1){ link = "http://" + link; }
		this.value = link;


		// attach the element id as data to be transfered to know which element to append when dropped over editable div
		event.originalEvent.dataTransfer.setData("text", event.target.getAttribute("id"));
		event.originalEvent.dataTransfer.dropEffect = 'move';
	}else {
		event.preventDefault();
	}
});


$("#toolBar [type=button]").on("click", function(event){

	if(linkCol.length){
		 $.post("/uploadlinks", { data: linkCol }, function(data){
		 	console.log(data);
		 });
			
	}

});


$("#loginBlock").delegate("#loginForm", "submit", function(event) {
	event.preventDefault();

	// clear img interval no point in asking for images from backend when submitting form and 
	// going to reload page anyway
	// clearInterval(getPrintInterval) // todo
	// get the element in loginBlock with current active class
	var state = $(this).closest("#loginBlock").find(".active");
	// serialize form fields
	var formdata = $(this).serializeArray();
	var data = {};
	$(formdata).each(function(index, obj){
	    data[obj.name] = obj.value;
	});

	$("#loginBlock").addClass("hide");
	$("#overlay").addClass("hide");


	var url = state[0] === $("#loginBlock span")[0] ? "/signin" : "/signup";


	$.post(url, data, function(){
			location.reload(true);
		});


});




$("#authLink").on("click", function(event){
	event.preventDefault();
	// If the #authLink element does not have the text Login/Signup within it then it has a username, 
	// of the signed in user. Then customize the html of the #loginBlock with a signout link
	if($(this).text().indexOf("Login/Signup") === -1) {
		$("#loginBlock").html("<a href='/signout'>signout</a>");
	}

	$("#loginBlock").removeClass("hide");
	$("#overlay").removeClass("hide");

});



$("#overlay").on("click", function(){
	$("#overlay").addClass("hide");
	$("#loginBlock").addClass("hide");

	$("#loginBlock .active").removeClass("active");
	$("#loginBlock span:first-child").addClass("active");
});




// Add the event listeners that will be added and removed as the editable layer is deleted and added
function addEditStateEvents() {


	$("#draftLayer").on("drop", function(event){
		event.preventDefault();
		// The info the dragged object will transfer will be its id as a string use it to attain the obj reference
		var textValue = event.originalEvent.dataTransfer.getData("text");
		var inpObjRef = document.getElementById(textValue);
		// Append the element dropped over the target element to the target itself (dropzome)
		event.target.appendChild(inpObjRef);
		// Position the elment where it was dropped and remove the draggable attribute
		inpObjRef.removeAttribute("id");
		inpObjRef.removeAttribute("draggable");
		$(inpObjRef).css({
			position: "absolute",
			top: (event.clientY-event.target.offsetTop) + "px",
			left: (event.clientX-(event.target.offsetLeft - (parseInt(event.target.style.width)/2))) + "px",
			// width: $(this).width - 
			// 	   (event.clientX-(event.target.offsetLeft - (parseInt(event.target.style.width)/2))) + "px",
			opacity: 0
		});

		var a = $("<a>", { href: inpObjRef.value, target: "_blank" });
		a.css({
			position: "absolute",
			top: $(inpObjRef).css("top"),
			left: $(inpObjRef).css("left"),
			color: $("#toolBar [type=color]").val()
		});

		a.text(inpObjRef.value);

		linkCol.push({ content: inpObjRef.value, top: $(inpObjRef).css("top"), left: $(inpObjRef).css("left"), color: $("#toolBar [type=color]").val() });


		$(this).append(a);
		$(inpObjRef).remove();


		$("#toolBar div:nth-child(3)").append("<input type='text' id='addTextBox' draggable='true' />");
	});


	$("#draftLayer").on("dragover", function(event){
		return false;
	});

}



function tailorCanvas(){
	// Find the smaller dimension of the clients screen
	smallerScreenDimen = window.innerHeight < window.innerWidth ? { height: window.innerHeight } : {width: window.innerWidth};
	// Use the smaller dimension between the height and width attained above and make canvas width 
	// the length of the smaller dimension and the height 60% of the same length
	if(smallerScreenDimen.height){
		if($("#draftLayer").length){
			$("#draftLayer").width(smallerScreenDimen.height + "px");
			$("#draftLayer").height( (smallerScreenDimen.height * 0.6) + "px");
		}
		
		$("#backSetting").width(smallerScreenDimen.height + "px");
		$("#backSetting").height( (smallerScreenDimen.height * 0.6) + "px");
	} else {
		if($("#draftLayer").length){
			$("#draftLayer").width(smallerScreenDimen.width + "px");
			$("#draftLayer").height( (smallerScreenDimen.width * 0.6) + "px");
		}
		
		$("#backSetting").width(smallerScreenDimen.width + "px");
		$("#backSetting").height( (smallerScreenDimen.width * 0.6) + "px");
	}

	if($("#draftLayer .dot").length){ scaleSketch(); }
}



// Scale the position of the child elements of the #draftLayer div as the draftLayer is scaled
function scaleSketch(){
	var dotElems = $("#draftLayer .dot");
	var textElems = $("#draftLayer [type=text]");

	if(lastWidthDimen !== parseInt($("#draftLayer").width())){
		for (var i = 0; i < dotElems.length; i++) {
			dotElems[i].style.left = (parseInt(dotElems[i].style.left)) * 
									 ((parseInt($("#draftLayer").width()))/lastWidthDimen) + "px";
			dotElems[i].style.top = (parseInt(dotElems[i].style.top)) * 
									 ((parseInt($("#draftLayer").width()))/lastWidthDimen) + "px";
		}

		for (var i = 0; i < textElems.length; i++) {
			textElems[i].style.left = (parseInt(textElems[i].style.left)) * 
									 ((parseInt($("#draftLayer").width()))/lastWidthDimen) + "px";
			textElems[i].style.top = (parseInt(textElems[i].style.top)) * 
									 ((parseInt($("#draftLayer").width()))/lastWidthDimen) + "px";
		}

		// Record the lastWidth (of the canvas) every time the smaller dimension of the screen is figured 
		// out (calculated) will use this for scaling when having to reposition child elements of editable 
		// div after scaling
		lastWidthDimen = parseInt($("#draftLayer").width());
	}
	
}




// function getNewCanvas() {

// 	$.get({
// 		url: '/updatedelements',
// 	})
// 	.done(function(imgs){
// 		var canvasLayer = $('#backSetting')[0];

//       		var currLastImg = canvasLayer.children.length > 0 ? 
//                         parseInt(canvasLayer.children[canvasLayer.children.length - 1].getAttribute("src").substr(13)) : 0;

// 		var domFrag = document.createDocumentFragment();

//         for(var i = 0, img; i < imgs.length; i++){

//         	if(currLastImg < parseInt(imgs[i].substr(13))){
//         		img = document.createElement("img");
//         		img.src = imgs[i];

//         		domFrag.appendChild(img);
//         	}
//         }

//         document.getElementById("backSetting").appendChild(domFrag);

//     });
// }


// Initialize the Canvas Dimensions
tailorCanvas();
// Record the lastWidth (of the canvas) every time the smaller dimension of the screen is figured out 
// will use this for scaling when having to reposition child elements of editable div after scaling
lastWidthDimen = smallerScreenDimen.height ? smallerScreenDimen.height : smallerScreenDimen.width;






// resize event handler will also be fired on any orientation changes that typically
// occur on mobile (touch screens) so no need to listen for orientation change events
$(window).on("resize", function(){ clearTimeout(scaleClose); scaleClose = setTimeout(tailorCanvas, 500); })


// getPrintInterval = window.setInterval(getNewCanvas, 20000);




