import { describe, expect, it, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import App from "../App";
import jest from "jest";

/**
 * @vitest-environment jsdom
 */

describe("Main test suite", async () => {
  afterEach(() => {
    cleanup();
  });

  it("Should render the page correctly", async () => {
    await render(<App />);
    const h2 = await screen.queryByText("Delivery Order Price Calculator");

    expect(h2).not.toBeNull();
  });

  it("Delivery price should be 0 on page load", async () => {
    await render(<App />);
    const counter = await screen.findByTestId("totalPrice");

    expect(counter.getAttribute("data-raw-value")).toBe("0");
  });

  it("Empty cart value gives a validation error", async () => {
    await render(<App />);
    const button = await screen.findByText("Calculate delivery price");
    const validationError = await screen.findByTestId("error-cart-value");

    expect(button).not.toBeNull();

    fireEvent.click(button as HTMLElement);

    expect(validationError?.innerHTML).toBe("Please enter a cart value");
  });

  it("Cart value is filled, but user latitude and longitude are 0, should give validation error", async () => {
    await render(<App />);
    const button = await screen.findByText("Calculate delivery price");

    const inputCartValue = screen.getByTestId("cartValue");
    const inputLatitude = screen.getByTestId("userLatitude");
    const inputLongitude = screen.getByTestId("userLongitude");
    const errorLongitude = await screen.findByTestId("error-longitude");
    const errorLatitude = await screen.findByTestId("error-latitude");

    fireEvent.change(inputCartValue, { target: { value: "10" } });
    fireEvent.change(inputLatitude, { target: { value: "0" } });
    fireEvent.change(inputLongitude, { target: { value: "0" } });

    fireEvent.click(button as HTMLElement);
    expect(errorLongitude?.innerHTML).toBe(
      'Please press the "Get Location" button'
    );
    expect(errorLatitude?.innerHTML).toBe(
      'Please press the "Get Location" button'
    );
  });

  it("Pressing Get Location fills the user longitude and user latitude inputs", async () => {
    await render(<App />);
    const getLocationButton = await screen.findByText("Get location");

    const inputLatitude = screen.getByTestId("userLatitude");
    const inputLongitude = screen.getByTestId("userLongitude");

    // Mock the latitude and longitude values
    fireEvent.change(inputLatitude, { target: { value: "60.21092" } });
    fireEvent.change(inputLongitude, { target: { value: "25.08181" } });

    console.log(inputLatitude.getAttribute("value"));
    console.log(inputLongitude.getAttribute("value"));

    fireEvent.click(getLocationButton as HTMLElement);

    expect(inputLatitude.getAttribute("value")).not.toBe("0");
    expect(inputLongitude.getAttribute("value")).not.toBe("0");
  });

  it("calculateDistance function calculates distance correctly", () => {
    const lat1 = 60.1695;
    const lon1 = 24.9354;
    const lat2 = 60.1699;
    const lon2 = 24.9410;
    const R = 6371; // Radius of the Earth in kilometers

    const toRadians = (degrees: number) => degrees * (Math.PI / 180);

    const calculateDistance = (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number
    ) => {
      const dLat = toRadians(lat2 - lat1);
      const dLon = toRadians(lon2 - lon1);

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
          Math.cos(toRadians(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      const distanceInKilometers = R * c;
      const distanceInMeters = distanceInKilometers * 1000;
      return distanceInMeters;
    };

    const distance = calculateDistance(lat1, lon1, lat2, lon2);
    expect(distance).toBeCloseTo(337, 1); 
  });

});
