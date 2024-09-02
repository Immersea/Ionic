import { r as registerInstance, l as createEvent, h } from './index-d515af00.js';

const appStarRatingCss = "app-star-rating{}";

const StarRating = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.rated = createEvent(this, "rated", 7);
        this._starCounter = new Array();
        this.rating = 0;
        this.size = 25;
        this.stars = 5;
        this.color = "gold";
        this.editable = false;
        this.currentRating = undefined;
    }
    componentWillLoad() {
        this.firstRun();
    }
    firstRun() {
        this.backupOriginalProps();
        this.initializeInternalState();
    }
    backupOriginalProps() {
        this._initialRatingOriginal = this.rating;
        this._fontSizeOriginal = this.size;
        this._numberOfStarsOriginal = this.stars;
        this._colorOriginal = this.color;
    }
    initializeInternalState() {
        this._fontSizeExpression = this.size.toString() + "px";
        this.currentRating = this.rating;
        this._starCounter = new Array(this.stars).fill(true);
    }
    propsHaveChanged() {
        return !(this.rating === this._initialRatingOriginal &&
            this.size === this._fontSizeOriginal &&
            this.color === this._colorOriginal &&
            this.stars === this._numberOfStarsOriginal);
    }
    componentDidLoad() {
        if (this.propsHaveChanged) {
            this.firstRun();
        }
    }
    render() {
        return (h("span", { key: 'f92a0df4d5eb8591900187e45cf5b341591fdb8b' }, this._starCounter.map((_, currentIndex) => (h("ion-icon", { name: this.iconName(currentIndex + 1), onClick: (_) => this.updateRating(currentIndex + 1), style: { "font-size": this._fontSizeExpression, color: this.color } })))));
    }
    updateRating(rating) {
        if (this.editable) {
            this.currentRating = rating;
            this.rated.emit(rating);
        }
    }
    iconName(starNumber) {
        const threshold = this.currentRating - starNumber;
        if (threshold >= 0) {
            return "star";
        }
        else {
            return "star-outline";
        }
    }
};
StarRating.style = appStarRatingCss;

export { StarRating as app_star_rating };

//# sourceMappingURL=app-star-rating.entry.js.map