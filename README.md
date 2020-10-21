# An interactive visualization on [GapMinder Dataset](https://www.gapminder.org/data/)

#### This project uses **d3** at its core to but is accelerated in performance using **React**.

This project visualizes various data against each other to provide valuable comparative analysis. It visualizes the data for all the contries across years that range from _1800_ and extrapolated until _2100_.

#### The functionalities provided in this project are

> - X and Y Axis selectors which can be used to select the required datasets to be plotted on the respective axes.
> - Regions menu which, on selection displays contries that belong only to that region.
> - A play pause button to scrub through the years and animate the datapoints through the years
> - A year slider which is used to manually scrub through the years.
> - A speed selection to vary the speed of animation.
> - Hovering on the data points shows the country name color coded in its region color
> - clicking in a datapoint shows the exact values of the country for that year

### A demo of this project deployed on heroku cloud is available here https://gapminder-viz.herokuapp.com

###### Dependencies

> - React
> - create-react-app
> - serve
> - d3
> - font-awesome

#### To locally run this project

1. Clone this repo
2. Build it using '''npm run build'''
3. serve it using '''serve -s build'''
