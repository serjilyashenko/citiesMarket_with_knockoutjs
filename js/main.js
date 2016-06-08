$(document).ready(function () {
	console.log("Hello Cities Market");

	function koScope(){
		var self = this;

		self.tabs = new (function(){
			var self = this;
			this.activeMethod = ko.observable("все");
			this.elements = ko.observableArray([
				{
					title: "все",
					searchMethod: "все"
				},
				{
					title: "евразия",
					searchMethod: "евразия"
				},
				{
					title: "северная америка",
					searchMethod: "северная америка"
				},
				{
					title: "южная америка",
					searchMethod: "южная америка"
				},
				{
					title: "африка",
					searchMethod: "африка"
				},
				{
					title: "авcтралия",
					searchMethod: "авcтралия"
				},
				{
					title: "антарктида",
					searchMethod: "антарктида"
				}
			]);

			this.onClick = function(tabElement){
				self.activeMethod(tabElement.title);
				console.log(self.activeMethod());

				filteredData = filterData(citiesData, self.activeMethod());
				firstCityNum = 0;
				// todo: убрать как-то koScope1
				koScope1.outputData.items( filteredData.slice(firstCityNum, firstCityNum + maxItemsOnPage) );
			};
		})();

		// submit from search form
		self.searchForm = function(){
			refreshData();
		};

		self.paginator = {
			shiftLeft: function(){ shiftPagContainer(200); },
			shiftRight: function(){ shiftPagContainer(-200); },
			select: function(data, event){
				if(event.target.className == "pagecontainer")
					return;
				$(".pagecontainer div").removeClass("active");
				var newActiveNumber = parseInt(event.target.className);
				var targetPosition = $(".pagecontainer_wrap").offset().left + $(".pagecontainer_wrap").width()/2;
				var activeItem = $($(".pagecontainer div")[newActiveNumber]);
				var shift = targetPosition - activeItem.offset().left;
				activeItem.addClass("active");
				shiftPagContainer(shift - 20);
				firstCityNum = newActiveNumber * maxItemsOnPage;
				// todo: изменить структуру для knockout
				koScope1.outputData.items( filteredData.slice(firstCityNum, firstCityNum + maxItemsOnPage) );
			}
		};

		//self.cityImage = "https://pixabay.com/static/uploads/photo/2015/10/01/21/39/background-image-967820_960_720.jpg";
		//self.detales = "hello";
		self.outputData = {
			populationMin: ko.observable(100),
			populationMax: ko.observable(25000000),
			yearMin: ko.observable(0),
			yearMax: ko.observable(2016),
			items: ko.observableArray([])
		};
	}

	var citiesData = {};
	var filteredData = {};
	var firstCityNum = 0;
	var maxItemsOnPage = 10;

    // showPaginator - showing and listening of page buttons of paginator
    var shiftPagContainer = function(shift){
            var lastItem = $(".pagecontainer div").last();
            var contWrap = $(".pagecontainer_wrap");
            var cont = $(".pagecontainer");
            cont.css('left', '+=' + shift + "px");
            if(cont.offset().left + shift > contWrap.offset().left)
                cont.css('left', 0 + "px");
            if(lastItem.offset().left + lastItem.width() + shift < contWrap.offset().left + contWrap.width())
                cont.css('left',(cont.offset().left - lastItem.offset().left - lastItem.width() - 10 + contWrap.width()) + "px");
    };
	var showPaginator = function(items){
		var dataLength = items.length;
		$(".paginator .pagecontainer").empty();
        for(var i = 0; i < (dataLength/maxItemsOnPage); i++){
            var container = $(".paginator .pagecontainer").append("<div>" + (i + 1) + "</div>");
            var item = $(".paginator .pagecontainer :last-child");
            item.addClass(i.toString());
            if(i == 0) item.addClass("active");
			$(".pagecontainer_wrap").width( $(".pagecontainer_wrap").width() + 30 );
        };
	}; // end of showPaginator
	// End of Footer actions

	//Content actions
	var refreshData = function(){
		var data = {
			// "populationMin": $("input[name='populationMin']").val(),
			"populationMin": koScope1.outputData.populationMin(),
			"populationMax": koScope1.outputData.populationMax(),
			"yearMin": koScope1.outputData.yearMin(),
			"yearMax": koScope1.outputData.yearMax()
		};
		$.post('./backend/refreshData.php', data, function(response){
			citiesData = response;
			filteredData = filterData(citiesData, koScope1.tabs.activeMethod());
			showPaginator(filteredData);
			// todo: придумать что-то со структурой и убрать вызов koScope1 отсюда
			koScope1.outputData.items( filteredData.slice(firstCityNum, firstCityNum + maxItemsOnPage) );
		}, 'json');

	};

	var filterData = function(citiesData, tabsMethod){
		if(tabsMethod === "все"){
			return citiesData.items;
		};
		var filteredData = citiesData.items.filter(function(item){
			return (item.continent === tabsMethod);
		});
		return filteredData;
	};
	//end content actions

	koScope1 = new koScope();

	ko.applyBindings(koScope1, document.getElementsByTagName("body")[0]);

	refreshData();
});
