$(document).ready(function () {
	console.log("Hello Cities Market");
	ko.applyBindings(new koScope(), document.getElementsByTagName("body")[0]);
});

function koScope(){
	var self = this;

	// privet vars
	var citiesData = {};
	var filteredData = ko.observableArray([]);
	//end of the privet vars

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
			filteredData(self.filterData(citiesData, self.activeMethod()));
			parent.paginator.select(0);		// refresh paginator on start position
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
		this.maxItemsOnPage = ko.observable(10);
		this.activePaginationItem = ko.observable(0);
		this.paginationItems = ko.computed(function(){
			var res = [];
			for(var i = 0; i < (filteredData().length/self.maxItemsOnPage()); i++){
				res.push(i);
			};
			return res;
		});
		this.width = ko.computed(function(){
			return (self.paginationItems().length * 30 + 'px');
		}, this);

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
		this.select = function(data, event){
			self.activePaginationItem(data);
			var targetPosition = $(".pagecontainer_wrap").offset().left + $(".pagecontainer_wrap").width()/2;
			var activeItem = $($(".pagecontainer div")[self.activePaginationItem()]);
			var shift = targetPosition - activeItem.offset().left;
			self.shiftPagContainer(shift - 20);
			self.firstCityNum = self.activePaginationItem() * self.maxItemsOnPage();
			parent.outputData.items( filteredData().slice(self.firstCityNum, self.firstCityNum + self.maxItemsOnPage()) );
		};
	})(this); // end of pagination

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
			filteredData(self.tabs.filterData(citiesData, self.tabs.activeMethod()));
			var paginatorObj = self.paginator;
			self.outputData.items( filteredData().slice(paginatorObj.firstCityNum, paginatorObj.firstCityNum + paginatorObj.maxItemsOnPage()) );
		}, 'json');
	};
	this.refreshData();

	// submit from search form
	self.searchForm = function(){
		self.refreshData();
	};

} // end of koScope
