$(document).ready(function () {
    console.log("Hello Cities Market");
    ko.applyBindings(new koScope(), document.getElementsByTagName("body")[0]);
});

function koScope() {
    var self = this;

    // Filtration tabs object
    this.tabs = new (function (parent) {
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
        this.onClick = function (tabElement) {
            self.activeMethod(tabElement.title);
            //filteredData(self.filterData(citiesData, self.activeMethod()));
            parent.paginator.select(0);		// refresh paginator on start position
        };
    })(this);	// end of Filtration tabs

    // Pagination object
    this.paginator = new (function (parent) {
        var self = this;
        this.firstCityNum = 0;
        this.maxItemsOnPage = ko.observable(10);
        this.activePaginationItem = ko.observable(0);
        this.paginationItems = ko.observableArray();
        this.updatePaginationItems = function () {
            var res = [];
            console.log(parent.outputData);
            if (parent.outputData) {
                console.log(parent.outputData.citiesData().items);
                for (var i = 0; i < (parent.outputData.citiesData().items.length / self.maxItemsOnPage()); i++) {
                    res.push(i);
                }
            } else
                res.push(0);

            this.paginationItems(res);
        };
        this.width = ko.computed(function () {
            return (self.paginationItems().length * 30 + 'px');
        }, this);

        this.shiftLeft = function () {
            this.shiftPagContainer(200);
        };
        this.shiftRight = function () {
            this.shiftPagContainer(-200);
        };
        this.shiftPagContainer = function (shift) {
            var lastItem = $(".pagecontainer div").last();
            var contWrap = $(".pagecontainer_wrap");
            var cont = $(".pagecontainer");

            cont.css('left', '+=' + shift + "px");
            if (cont.offset().left + shift > contWrap.offset().left)
                cont.css('left', 0 + "px");
            if (lastItem.offset().left + lastItem.width() + shift < contWrap.offset().left + contWrap.width())
                cont.css('left', (cont.offset().left - lastItem.offset().left - lastItem.width() - 10 + contWrap.width()) + "px");
        };
        this.select = function (data, event) {
            self.activePaginationItem(data);
            // shift calculation on jQuery
            var targetPosition = $(".pagecontainer_wrap").offset().left + $(".pagecontainer_wrap").width() / 2;
            var activeItem = $($(".pagecontainer div")[self.activePaginationItem()]);
            var shift = targetPosition - activeItem.offset().left;
            // end of shift calculation

            self.shiftPagContainer(shift - 20);
        };
    })(this); // end of pagination

    this.outputData = new (function (parent) {
        var self = this;
        this.populationMin = ko.observable(100);
        this.populationMax = ko.observable(25000000);
        this.yearMin = ko.observable(0);
        this.yearMax = ko.observable(2016);
        this.citiesData = ko.observable({
            items: []
        });
        // todo: сделать нормальную filteredData2: ko.computed(function(){
        this.filteredData2 = ko.computed(function () {
            var filteredData = [];
            if (parent.tabs.activeMethod() === "все") {
                filteredData = self.citiesData().items;
            } else {
                filteredData = self.citiesData().items.filter(function (item) {
                    return (item.continent === parent.tabs.activeMethod());
                });
            }
            ;
            var paginatorObj = parent.paginator;
            paginatorObj.firstCityNum = paginatorObj.activePaginationItem() * paginatorObj.maxItemsOnPage();
            // todo: сделать нормальную filteredData2: ko.computed(function(){
            if (filteredData)
                return filteredData.slice(paginatorObj.firstCityNum, paginatorObj.firstCityNum + paginatorObj.maxItemsOnPage());
        }, this)
    })(this);

    // submit from search form
    self.searchForm = function () {
        self.refreshData();
    };

    this.refreshData = function () {
        var self = this;
        var data = {
            "populationMin": this.outputData.populationMin(),
            "populationMax": this.outputData.populationMax(),
            "yearMin": this.outputData.yearMin(),
            "yearMax": this.outputData.yearMax()
        };
        $.post('./backend/refreshData.php', data, function (response) {
            // todo: проверка на наличие свойства items в response
            self.outputData.citiesData(response);
            self.paginator.updatePaginationItems();
            // self.paginator.select(0);		// refresh paginator on start position
        }, 'json');
    };
    this.refreshData();


} // end of koScope
