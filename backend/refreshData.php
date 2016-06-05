<?php

// Checking of input data

function checkInData($paramName, $default, $min, $max){
 	if(isset($_POST[$paramName])){
 		$res = $_POST[$paramName];
//	if(true){
//		$res = $paramName;
		if((is_numeric($res)) and ($res >= $min) and ($res <= $max)){
			return $res;
		};
	};
	return $default;
};

$populationMinDefault = 100;
$populationMaxDefault = 25000000;
$yearMinDefault = 0;
$yearMaxDefault = 2016;
$populationMin = checkInData("populationMin", 100, 100, $populationMaxDefault);
$populationMax = checkInData("populationMax", $populationMaxDefault, $populationMin, $populationMaxDefault);
$yearMin = checkInData("yearMin", $yearMinDefault, $yearMinDefault, $yearMaxDefault);
$yearMax = checkInData("yearMax", $yearMaxDefault, $yearMin, $yearMaxDefault);
//$populationMin = checkInData(500, 100, 100, $populationMaxDefault);
//$populationMax = checkInData(300, $populationMaxDefault, $populationMin, $populationMaxDefault);
//$yearMin = checkInData(1500, $yearMinDefault, $yearMinDefault, $yearMaxDefault);
//$yearMax = checkInData(500, $yearMaxDefault, $yearMin, $yearMaxDefault);
// End of checking of input data


// Random server answer
$continents = array("евразия", "северная америка", "южная америка", "африка", "авcтралия", "антарктида");

$res = array(
	"meta" => array(
		"populationMin" => $populationMin,
		"populationMax" => $populationMax,
		"yearMin" => $yearMin,
		"yearMax" => $yearMax,
	),
	"items" => array()
);
$count = 1000;
for($i = 1; $i <= $count; $i++){
	$res["items"][] = array(
		"num" => $i,
		"name" => "Город $i",
		"year" => rand($yearMin, $yearMax),
		"population" => rand($populationMin, $populationMax),
		"continent" => $continents[rand(0, 4)],
		"image" => "http://lorempixel.com/150/150/city/" . rand(1, 10),
	);
};

header('Content-Type: application/json');
echo json_encode($res);

?>
