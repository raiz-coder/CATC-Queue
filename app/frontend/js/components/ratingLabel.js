/**
 * js/components/ratingLabel.js
 * Star rating label markup.
 */

const ratingLabel = t => {
    const r = getRating(t);
    return r.count ? `<span class="star">★ ${r.avg.toFixed(1)}</span> (${r.count})` : "No ratings yet";
};
