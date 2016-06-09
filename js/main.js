$(document).ready(function () {
	console.log("Hello Cities Market");
	ko.applyBindings(new koScope(), document.getElementsByTagName("body")[0]);
});

function koScope(){
	var self = this;

	// Filtration tabs object
	this.tabs = new (function(parent){
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
			filteredData = self.filterData(citiesData, self.activeMethod());
			firstCityNum = 0;
			parent.outputData.items( filteredData.slice(parent.paginator.firstCityNum, parent.paginator.firstCityNum + parent.paginator.maxItemsOnPage) );
		};
		this.filterData = function(citiesData, tabsMethod){
			if(tabsMethod === "все"){
				return citiesData.items;
			};
			var filteredData = citiesData.items.filter(function(item){
				return (item.continent === tabsMethod);
			});
			return filteredData;
		};
	})(this);	// end of Filtration tabs

	// Pagination object
	this.paginator = new (function(parent){
		var self = this;
		this.firstCityNum = 0;
		this.maxItemsOnPage = 10;

		this.shiftLeft = function(){ this.shiftPagContainer(200); };
		this.shiftRight = function(){ this.shiftPagContainer(-200); };
		this.shiftPagContainer = function(shift){
			var lastItem = $(".pagecontainer div").last();
			var contWrap = $(".pagecontainer_wrap");
			var cont = $(".pagecontainer");
			cont.css('left', '+=' + shift + "px");
			if(cont.offset().left + shift > contWrap.offset().left)
			    cont.css('left', 0 + "px");
			if(lastItem.offset().left + lastItem.width() + shift < contWrap.offset().left + contWrap.width())
				cont.css('left',(cont.offset().left - lastItem.offset().left - lastItem.width() - 10 + contWrap.width()) + "px");
		};
		this.showPaginator = function(items){
			var dataLength = items.length;
			$(".paginator .pagecontainer").empty();
			for(var i = 0; i < (dataLength/self.maxItemsOnPage); i++){
				var container = $(".paginator .pagecontainer").append("<div>" + (i + 1) + "</div>");
				var item = $(".paginator .pagecontainer :last-child");
				item.addClass(i.toString());
				if(i == 0) item.addClass("active");
				$(".pagecontainer_wrap").width( $(".pagecontainer_wrap").width() + 30 );
			};
		};
		this.select = function(data, event){
			if(event.target.className == "pagecontainer")
				return;
			$(".pagecontainer div").removeClass("active");
			var newActiveNumber = parseInt(event.target.className);
			var targetPosition = $(".pagecontainer_wrap").offset().left + $(".pagecontainer_wrap").width()/2;
			var activeItem = $($(".pagecontainer div")[newActiveNumber]);
			var shift = targetPosition - activeItem.offset().left;
			activeItem.addClass("active");
			this.shiftPagContainer(shift - 20);
			this.firstCityNum = newActiveNumber * this.maxItemsOnPage;
			parent.outputData.items( filteredData.slice(this.firstCityNum, this.firstCityNum + this.maxItemsOnPage) );
		};
	})(this); // end of pagination

	// privet vars
	var citiesData = {};
	var filteredData = {};
	//end of the privet vars

	this.outputData = {
		populationMin: ko.observable(100),
		populationMax: ko.observable(25000000),
		yearMin: ko.observable(0),
		yearMax: ko.observable(2016),
		items: ko.observableArray([])
	};

	this.refreshData = function(){
		var self = this;
		var data = {
			"populationMin": this.outputData.populationMin(),
			"populationMax": this.outputData.populationMax(),
			"yearMin": this.outputData.yearMin(),
			"yearMax": this.outputData.yearMax()
		};
		$.post('./backend/refreshData.php', data, function(response){
			citiesData = response;
			filteredData = self.tabs.filterData(citiesData, self.tabs.activeMethod());
			self.paginator.showPaginator(filteredData);
			// todo: придумать что-то со структурой и убрать вызов koScope1 отсюда
			var paginatorObj = self.paginator;
			self.outputData.items( filteredData.slice(paginatorObj.firstCityNum, paginatorObj.firstCityNum + paginatorObj.maxItemsOnPage) );
		}, 'json');
	};
	this.refreshData();

	// submit from search form
	self.searchForm = function(){
		self.refreshData();
	};

} // end of koScope
