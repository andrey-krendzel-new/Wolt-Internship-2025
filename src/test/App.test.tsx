import { describe, expect, it, afterEach } from "vitest";
import { render, waitFor, screen, fireEvent, cleanup } from "@testing-library/react";
import App from "../App";

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
  });