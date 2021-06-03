// Class used for styles
class Style {
    constructor(background, color) {
        this.background = background;   // Background of application
        this.color = color;             // Content color
    }

    // Returns css for application
    getStr() {
        let styleStr = "";

        if (this.background) styleStr += `background: ${this.background};`
        if (this.color) styleStr += `color: ${this.color};`

        return styleStr;
    }

    // Returns css for borders
    getTextBorderColorStr() {
        let styleStr = "";
        if (this.color) styleStr += `color: ${this.color}; border-color: ${this.color};`
        return styleStr;
    }

    // Returns css for buttons
    getButtonStr() {
        if (!this.color) return "";
        let textcolor = !cmnIsDarkColor(this.color) ? "#212529" : "#f8f9fa";
        return `color: ${textcolor}; background-color: ${this.color};`
    }

    // Returns css for outlines
    getOutlineColor() {
        if (!this.color) return "";
        let textcolor = !cmnIsDarkColor(this.color) ? "#dee2e6" : "#212529";
        return `outline-color: ${textcolor};`
    }

    // Returns css for crosses
    getCrossStr() {
        if (!this.color) return "";
        return `filter: invert(${cmnIsDarkColor(this.color) ? 0 : 1}) grayscale(100%) brightness(200%);`
    }
}

// Creates style object from json object
function getStyleObjFromJson (dict) {
    if (!dict || !dict.background || !dict.color) return null;
    return new Style(dict.background, dict.color);
}

// Default style
const DEFAULT_STYLE = new Style("#343a40", "#f8f9fa");

// Styles to choose from
CUSTOM_STYLES = [
    DEFAULT_STYLE,
    new Style("#c6c6c6", "#212529"),
    new Style("linear-gradient(to right, #bdc3c7, #2c3e50);", "#212529"),
    new Style("linear-gradient(to right, #ee9ca7, #ffdde1);", "#212529"),
    new Style("linear-gradient(to top left, #c6ffdd, #fbd786, #f7797d);", "#212529"),
    new Style("linear-gradient(to top, #1f4037, #99f2c8);", "#212529"),
    new Style("linear-gradient(to bottom right, #c31432, #240b36);", "#f8f9fa"),
    new Style("linear-gradient(to top, #0f2027, #203a43, #2c5364);", "#f8f9fa")
]
