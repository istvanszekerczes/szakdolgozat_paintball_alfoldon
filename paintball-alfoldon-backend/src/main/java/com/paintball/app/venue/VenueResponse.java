package com.paintball.app.venue;

public record VenueResponse(String slug, String city, String name, boolean indoor, String address,
        double latitude, double longitude, int minHeadcount, int maxHeadcount) {

    public static VenueResponse from(Venue venue) {
        return new VenueResponse(venue.getSlug(), venue.getCity(), venue.getName(), venue.isIndoor(),
                venue.getAddress(), venue.getLatitude(), venue.getLongitude(), venue.getMinHeadcount(),
                venue.getMaxHeadcount());
    }
}
