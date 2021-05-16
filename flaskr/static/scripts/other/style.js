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
    getTextOutlineColorStr() {
        let styleStr = "";
        if (this.color) styleStr += `color: ${this.color}; border-color: ${this.color};`
        return styleStr;
    }
    getButtonStr() {
        let styleStr = "";
        let textcolor = !cmnIsDarkColor(this.color) ? "#212529" : "#f8f9fa";
        if (this.color) styleStr += `color: ${textcolor}; background-color: ${this.color};`
        return styleStr;
    }
}

const DEFAULT_STYLE = new Style("#343a40", "#f8f9fa");

CUSTOM_STYLES = [
    DEFAULT_STYLE,
    new Style("linear-gradient(to right, #bdc3c7, #2c3e50);", "#303030"),
    new Style("white", "#303030")
]
