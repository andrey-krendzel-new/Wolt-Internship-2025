import { describe, expect, it, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
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

    fireEvent.click(getLocationButton as HTMLElement);
    expect(inputLatitude.getAttribute("value")).not.toBe("0");
    expect(inputLongitude.getAttribute("value")).not.toBe("0");
  });

  it("If cart value, user latitude and user longitude are not null, should return price breakdown", async () => {
    await render(<App />);
    const button = await screen.findByText("Calculate delivery price");
    const getLocationButton = await screen.findByText("Get location");

    const inputCartValue = screen.getByTestId("cartValue");
    const userLatitude = screen.getByTestId("userLatitude");
    const userLongitude = screen.getByTestId("userLongitude");
    const cartValue = await screen.findByTestId("cartResultValue");
    const deliveryFee = await screen.findByTestId("deliveryFee");
    const deliveryDistance = await screen.findByTestId("deliveryDistance");
    const smallOrderSurcharge = await screen.findByTestId(
      "smallOrderSurcharge"
    );
    const totalPrice = await screen.findByTestId("totalPrice");

    fireEvent.change(inputCartValue, { target: { value: "10" } });
    fireEvent.change(userLatitude, { target: { value: "60.21092" }})
    fireEvent.change(userLongitude, { target: { value: "25.08181" }})

    fireEvent.click(button);

    console.log("Cart value " + cartValue.innerHTML);
    console.log("User longitude " + userLongitude.innerHTML);
    console.log("Delivery fee " + deliveryFee.innerHTML);

    expect(cartValue.innerHTML).not.toBe("0.00 €");
    expect(deliveryFee.innerHTML).not.toBe("0.00 €");
    expect(deliveryDistance.innerHTML).not.toBe("0 m");
    expect(smallOrderSurcharge.innerHTML).not.toBe("0.00 €");
    expect(totalPrice.innerHTML).not.toBe("0.00 €");
  });

  // it("Should return correct price breakdown. Example case: cart value of 4, distance of 1500m, user latitude 60.21092, user longitude, 25.08181.", async () => {
  //   await render(<App />);
  //   const button = await screen.findByText("Calculate delivery price");

  //   const inputCartValue = screen.getByTestId("cartValue");
  //   const inputLatitude = screen.getByTestId("userLatitude");
  //   const inputLongitude = screen.getByTestId("userLongitude");
  //   const cartValue = await screen.findByTestId("cartResultValue");
  //   const deliveryFee = await screen.findByTestId("deliveryFee");
  //   const deliveryDistance = await screen.findByTestId("deliveryDistance");
  //   const smallOrderSurcharge = await screen.findByTestId(
  //     "smallOrderSurcharge"
  //   );
  //   const totalPrice = await screen.findByTestId("totalPrice");

  //   fireEvent.change(inputCartValue, { target: { value: "4" } });
  //   fireEvent.change(inputLatitude, { target: { value: "60.21092" } });
  //   fireEvent.change(inputLongitude, { target: { value: "25.08181" } });

  //   await fireEvent.click(button as HTMLElement);
  //   expect(cartValue.innerHTML).toBe("4.00 €");
  //   expect(deliveryFee.innerHTML).toBe("5.40 €");
  //   expect(deliveryDistance.innerHTML).toBe("1500 m");
  //   expect(smallOrderSurcharge.innerHTML).toBe("6.00 €");
  //   expect(totalPrice.innerHTML).not.toBe("15.40 €");
  // });
});
