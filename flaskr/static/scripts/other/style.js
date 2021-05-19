class Style {
    constructor(background, color) {
        this.background = background;
        this.color = color;
    }
    getStr() {
        let styleStr = "";

        if (this.background) styleStr += `background: ${this.background};`
        if (this.color) styleStr += `color: ${this.color};`

        return styleStr;
    }
    getTextBorderColorStr() {
        let styleStr = "";
        if (this.color) styleStr += `color: ${this.color}; border-color: ${this.color};`
        return styleStr;
    }
    getButtonStr() {
        if (!this.color) return "";
        let textcolor = !cmnIsDarkColor(this.color) ? "#212529" : "#f8f9fa";
        return `color: ${textcolor}; background-color: ${this.color};`
    }
    getOutlineColor() {
        if (!this.color) return "";
        let textcolor = !cmnIsDarkColor(this.color) ? "#dee2e6" : "#212529";
        return `outline-color: ${textcolor};`
    }
}

function getStyleObjFromJson (dict) {
    if (!dict || !dict.background || !dict.color) return null;
    return new Style(dict.background, dict.color);
}

const DEFAULT_STYLE = new Style("#343a40", "#f8f9fa");

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
