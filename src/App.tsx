import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [cartValue, setCartValue] = useState(0);
  const [orderMinimum, setOrderMinimum] = useState(0);
  const [basePrice, setBasePrice] = useState(0);
  const [distanceRanges, setDistanceRanges] = useState([
    {
      min: 0,
      max: 500,
      a: 0,
      b: 0,
      flag: null,
    },
    {
      min: 500,
      max: 1000,
      a: 100,
      b: 1,
      flag: null,
    },
    {
      min: 1000,
      max: 0,
      a: 0,
      b: 0,
      flag: null,
    },
  ]);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryDistance, setDeliveryDistance] = useState(0);
  const [venueSlug, setVenueSlug] = useState("home-assignment-venue-helsinki");
  const [userLatitude, setUserLatitude] = useState(0);
  const [userLongitude, setUserLongitude] = useState(0);
  const [venueLatitude, setVenueLatitude] = useState(0);
  const [venueLongitude, setVenueLongitude] = useState(0);
  const [smallOrderSurcharge, setSmallOrderSurcharge] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [errorVenueSlug, setErrorVenueSlug] = useState("");
  const [errorCartValue, setErrorCartValue] = useState("");
  const [errorLatitude, setErrorLatitude] = useState("");
  const [errorLongitude, setErrorLongitude] = useState("");
  const [errorGeneral, setErrorGeneral] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  //Fetching from backend

  const fetchData = () => {
    fetch(
      `https://consumer-api.development.dev.woltapi.com/home-assignment-api/v1/venues/${venueSlug}/static`
    )
      .then((response) => {
        if (response.status !== 200) {
          throw new Error("Error fetching static data from the server");
        }
        return response.json();
      })
      .then((data) => {
        setVenueLongitude(data.venue_raw.location.coordinates[0]);
        setVenueLatitude(data.venue_raw.location.coordinates[1]);
      })
      .catch((error) => {
        setErrorGeneral(error.toString());
      });

    fetch(
      `https://consumer-api.development.dev.woltapi.com/home-assignment-api/v1/venues/${venueSlug}/dynamic`
    )
      .then((response) => {
        if (response.status !== 200) {
          throw new Error("Error fetching dynamic data from the server");
        }
        return response.json();
      })
      .then((data) => {
        setOrderMinimum(
          data.venue_raw.delivery_specs.order_minimum_no_surcharge
        );
        setBasePrice(data.venue_raw.delivery_specs.delivery_pricing.base_price);
        setDistanceRanges(
          data.venue_raw.delivery_specs.delivery_pricing.distance_ranges
        );
      })
      .catch((error) => {
        setErrorGeneral(error.toString());
      });

    return true;
  };

  //Code to get the location
  interface Coordinates {
    latitude: number;
    longitude: number;
  }

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Location needs to be enabled in the browser.");
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            reject(`Error: ${error.message}`);
          }
        );
      }
    });
  };

  //Code to calculate the distance between user and venue using Haversine formula
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

    const R = 6371; // Radius of the Earth in kilometers
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

  const handleCalculateDistance = () => {
    const distance = calculateDistance(
      userLatitude,
      userLongitude,
      venueLatitude,
      venueLongitude
    );
    //return distance;
    return 1500; // Can hardcode 1500m for easier testing
  };

  const placeDistanceWithinDistanceRanges = (distance: number) => {
    let a = -1;
    let b = -1;

    for (const range of distanceRanges) {
      if (distance >= range.min && distance < range.max) {
        a = range.a;
        b = range.b;
        break;
      }
    }

    if (a === -1 && b === -1) {
      setErrorGeneral(
        "Error: Distance out of reach. Delivery price cannot be calculated."
      );
    }

    return { a, b };
  };

  const calculateSmallOrderSurcharge = () => {
    if (cartValue * 100 < orderMinimum) {
      let smallOrderSurcharge = orderMinimum - cartValue * 100;
      return smallOrderSurcharge;
    } else {
      return 0;
    }
  };

  // Handling inputs
  const handleGetLocation = async () => {
    try {
      const location: Coordinates = (await getLocation()) as Coordinates;
      setUserLatitude(location.latitude);
      setUserLongitude(location.longitude);
    } catch (error: any) {
      console.error(error);
      setErrorGeneral(error);
    }
  };

  const onChangeVenueSlug = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVenueSlug(event.target.value);
  };

  const isNumerical = (value: string) => {
    return /^\d+(\.\d+)?$/.test(value);
  };

  const onChangeCartValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isNumerical(event.target.value)) {
      setErrorCartValue("The value should be a numerical value");
    } else {
      setCartValue(Number(event.target.value));
      setErrorCartValue("");
    }
  };

  const onChangeUserLatitude = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isNumerical(event.target.value)) {
      setErrorLatitude("The value should be a numerical value");
    } else {
      setUserLatitude(Number(event.target.value));
      setErrorLatitude("");
    }
  };

  const onChangeUserLongitude = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!isNumerical(event.target.value)) {
      setErrorLongitude("The value should be a numerical value");
    } else {
      setUserLongitude(Number(event.target.value));
      setErrorLongitude("");
    }
  };

  //Validation

  const formValidation = () => {
    if (venueSlug === "") {
      setErrorVenueSlug("Please enter a venue slug");
      return false;
    }

    if (cartValue === 0) {
      setErrorCartValue("Please enter a cart value");
      return false;
    }

    if (userLatitude === 0 && userLongitude === 0) {
      setErrorLatitude('Please press the "Get Location" button');
      setErrorLongitude('Please press the "Get Location" button');
      return false;
    }

    if (
      venueSlug !== "" &&
      cartValue !== 0 &&
      userLatitude !== 0 &&
      userLongitude !== 0
    ) {
      setErrorVenueSlug("");
      setErrorCartValue("");
      setErrorLatitude("");
      setErrorLongitude("");
    }

    return true;
  };

  //Calculating delivery price

  const calculateDeliveryPrice = () => {
    //Only execute the code if formValidation is succesful
    if (formValidation()) {
      let distance = handleCalculateDistance();
      let { a, b } = placeDistanceWithinDistanceRanges(distance);
      let smallOrderSurcharge = calculateSmallOrderSurcharge();
      let deliveryFee = basePrice + a + (b * distance) / 10;
      let totalPrice = cartValue * 100 + deliveryFee + smallOrderSurcharge;
      if (a === -1 || b === -1) {
        setDeliveryFee(0);
        setDeliveryDistance(0);
        setSmallOrderSurcharge(0);
        setTotalPrice(0);
      } else {
        setDeliveryFee(deliveryFee);
        setDeliveryDistance(distance);
        setSmallOrderSurcharge(smallOrderSurcharge);
        setTotalPrice(totalPrice);
      }
    }
  };

  return (
    <div className="form-box">
      <img
        className="logo"
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Wolt-logo-2019.png/600px-Wolt-logo-2019.png"
      />
      <h2>Delivery Order Price Calculator</h2>
      <h3>Details</h3>
      <form>
        <label>Venue slug:</label>
        <input
          className="formInput"
          type="text"
          name="venueSlug"
          value={venueSlug}
          data-testid="venueSlug"
          onChange={onChangeVenueSlug}
        />
        <p className="errorMessage">{errorVenueSlug}</p>
        <label>Cart value (EUR):</label>
        <input
          className="formInput"
          type="number"
          name="cartValue"
          data-testid="cartValue"
          step="0.01"
          onChange={onChangeCartValue}
        />
        <p className="errorMessage" data-testid="error-cart-value">
          {errorCartValue}
        </p>
        <label>User latitude:</label>
        <input
          className="formInput"
          type="text"
          name="userLatitude"
          value={userLatitude}
          onChange={onChangeUserLatitude}
          data-testid="userLatitude"
          disabled={true}
        />
        <p className="errorMessage" data-testid="error-latitude">
          {errorLatitude}
        </p>
        <label>User longitude:</label>
        <input
          className="formInput"
          type="text"
          name="userLongitude"
          value={userLongitude}
          onChange={onChangeUserLongitude}
          data-testid="userLongitude"
          disabled={true}
        />
        <p className="errorMessage" data-testid="error-longitude">
          {errorLongitude}
        </p>
      </form>
      <div className="buttons">
        <button className="blue" onClick={() => handleGetLocation()}>
          Get location
        </button>
        <button className="blue" onClick={() => calculateDeliveryPrice()}>
          Calculate delivery price
        </button>
      </div>
      {errorGeneral && <p className="errorMessageGeneral">{errorGeneral}</p>}
      <h3>Price breakdown</h3>
      <table>
        <tbody>
          <tr>
            <td>Cart Value:</td>
            <td data-raw-value={cartValue * 100} data-testid="cartResultValue">
              {cartValue.toFixed(2)} €
            </td>
          </tr>
          <tr>
            <td>Delivery Fee:</td>
            <td data-raw-value={deliveryFee * 100} data-testid="deliveryFee">
              {(deliveryFee / 100).toFixed(2)} €
            </td>
          </tr>
          <tr>
            <td>Delivery Distance:</td>
            <td
              data-raw-value={deliveryDistance}
              data-testid="deliveryDistance"
            >
              {deliveryDistance.toFixed(0)} m
            </td>
          </tr>
          <tr>
            <td>Small Order Surcharge:</td>
            <td
              data-raw-value={smallOrderSurcharge}
              data-testid="smallOrderSurcharge"
            >
              {(smallOrderSurcharge / 100).toFixed(2)} €
            </td>
          </tr>
          <tr>
            <td>Total Price:</td>
            <td data-raw-value={totalPrice} data-testid="totalPrice">
              {(totalPrice / 100).toFixed(2)} €
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default App;
