# map-side-bar 

[![npm version](https://badge.fury.io/js/%40abi-software%2Fmap-side-bar.svg)](https://badge.fury.io/js/%40abi-software%2Fmap-side-bar)
[![Maintainability](https://api.codeclimate.com/v1/badges/8dd727f153711aaae6e1/maintainability)](https://codeclimate.com/github/Tehsurfer/map-side-bar/maintainability)

This project aims to process and display csv files as graphs in the vue framework

Demo the site functionality of this app [here](https://map-side-bar-demo.herokuapp.com/)*. 

*_Demo will take 30s to load while Heroku server boots_

![demo](https://user-images.githubusercontent.com/37255664/73617045-a3231e00-467f-11ea-90bd-b1074acd26b3.gif)

## Project installation
```
npm i @abi-software/map-side-bar
```


## Project setup
```
npm install
npm run serve
```

### Compiles and minifies for production
```
npm run build-bundle
```

## How to use
Include the package in your script.
```javascript
import '@abi-software/map-side-bar'
import '@abi-software/map-side-bar/dist/map-side-bar.css'
```

The snippet above registers the map-side-bar component into the global scope.
You can now use the map-side-bar in your vue template as followed:
```html
<map-side-bar :url="csvfile.csv"></map-side-bar>
```
_Optional Parameters_: 
 1. Type of plot - Use 'scatter, 'heatmap', or 'barplot'.
 2. Plot filters - Filters will preload the plot with the supplied data
```html
<map-side-bar :url="csvfile.csv" :plotType="'scatter'" :xAxisFilter="['step1', 'step2']"></map-side-bar>
```

`url` should be the variable/string containing the url of a csv file.

`plotType` is the type of plot we wish to see the data as one of: `'heatmap', 'scatter', 'barplot'` 

`xAxisFilter` and `yAxisFilter` provide filters to load the plot with selected filters displayed.


## CSV file formatting

`map-side-bar` will load and csv file that follow the form of headers on first row and coloumn and if data is time based, rows will be assumed to be time dependant. 

### Example 1. Heatmap data

|               | Gene 1  | Gene 2 | 
| :------------ |:--------|  ------| 
| Sample 1      | -1.54 | -3.40 |
| Sample 2      | 0.68       |   1.22 |
| Sample 3      | 0.05      |    0.66 |


### Example 2. Timeseries data


| time (seconds)| Sweep 0_Membrane Potential (mV) | 
| :------------ |:--------|  
| 0     | -70.12939453 | 
| 0.0002    | -70.12939453     |
| 0.0004      | -70.34301758      | 
