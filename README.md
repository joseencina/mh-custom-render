# Equativ MH+ Custom Render

## Overview
This repository demonstrates how to implement conditional rendering using the Equativ Managed Holistic+ (MH+) product.

> [!IMPORTANT]
> This integration requires activation of the MH+ product.\
> Please refer to the official [MH+ documentation](https://help.smartadserver.com/s/article/Managed-Holistic).

## Objective
This integration addresses the need to selectively render ad formats based on conditions set by Equativ MH+ and Prebid Header Bidding.

It enhances user experience by preventing overlapping ads, providing a workound for publishers willing to improve the delivered ads.

The most common scenario is to avoid displaying skyscrapers (lateral banners) when a background ad is already visible, not covering any parts of this background creative.

> [!NOTE]
> This custom integration is tailored for rendering Equativ's ad formats.

## Context

### Prebid Global Object
As part of Equativ's configuration with Prebid, the `pbjs` global object is replaced with `pbjsEqtv`.

To verify this setup, you can inspect `_pbjsGlobals` in the browser's *Developer Console*.

Console output when using Equativ MH+ integration:
```javascript
> _pbjsGlobals
> ['pbjsEqtv']
```

### Winner Bidder
Determining when to apply conditions involves identifying the highest bidder from Prebid. Equativ utilizes the `getHighestCpmBids()` method to provide bid information necessary for decision-making.

Example usage with an `adUnitCode` based on Equativ's Prebid configuration:

```javascript
pbjsEqtv.getHighestCpmBids("siteID/publisherdomain.com/formatID");
// Result -> {bidderCode: 'appnexus', width: 728, height: 90, statusMessage: 'Bid available', adId: '1234abcd5678', …}
```

### Equativ Events
This integration utilizes Equativ's `onAd` and `onNoad` event handlers to manage ad rendering conditions.

#### `Ad` Event
Triggered when Equativ **successfully delivers an ad** for a specific format. This event does not trigger if no Prebid winner is detected for the format.

#### `Noad` Event
Triggered when Equativ **does not deliver** an ad. This occurs either when there is a Prebid winner or when no ad is available for the format.

> [!NOTE]
> Further details on these events are available in [Equativ's official documentation](https://help.smartadserver.com/s/article/Tagging-guide-2-implementation).

## Integration Steps
The following steps guide you through setting up conditions for rendering or avoiding ad formats.

> [!IMPORTANT]
> This guide assumes that certain formats should not render when others are displayed through Prebid, and vice versa.\
> E.g. If format `megabanner_format` is displayed, then `lat_format_right` and `lat_format_left` are not rendered.

### 1. Avoid Rendering Specific Format(s)
Exclude rendering logic for specific formats to prevent overlapping ads.

Example for lateral (skyscraper) ad formats:

```javascript
// This code should be REMOVED or NOT to be included
sas.render('lat_format_right');
sas.render('lat_format_left');
```

### 2. Render Formats on `Ad` Event
When an `Ad` event is detected for a monitored format, Equativ confirms there is no Prebid winner, triggering rendering of other formats.

Example code snippet:

```javascript
sas.call("onecall", {
    /**
     * Ad Placement Information
     */
}, {
    onAd: function(data){
        if (data.tagId === "megabanner_format") {
            sas.render("lat_format_right");
            sas.render("lat_format_left");
        }
    }
});

```

### 3. Render Formats on `Noad` Event
When a `Noad` event is linked to a format, Equativ determines the presence of a Prebid winner or the absence of available ads. Based on this, decide whether to render other formats.

Example code snippet:

```javascript
sas.call("onecall", {
    /**
     * Ad Placement Information
     */
}, {
    onNoad: function(data){
        if(data.tagId === 'megabanner_format') {
            // Check if a specific bidder is not the winner (e.g., appnexus)
            if(
                pbjsEqtv.getHighestCpmBids("siteID/publisherdomain.com/" + data.formatId)[0] === undefined ||
                pbjsEqtv.getHighestCpmBids("siteID/publisherdomain.com/" + data.formatId)[0].bidderCode !== "appnexus"
            ) {
                sas.render('lat_format_right');
                sas.render('lat_format_left');
            } else {
                // Log that the specified bidder is the winner
                console.log('appnexus is the winner');
            }
        }
    }
});
```

> [!NOTE]
> Whether the expected Prebid winner differs or no ad is available, render other formats accordingly.

> [!TIP]
> Both `onAd` and `onNoad` event handlers receive format-specific information through the `data` parameter.

## Disclaimer

The Fortmar IDs and Tag IDs references (e.g., megabanner_format) provided are purely illustrative.

Please ensure that the integration in your own code handles the necessary formats as required.

## Complete Code
For a comprehensive implementation, refer to the code configuration provided in `mh-custom-render.js`.
