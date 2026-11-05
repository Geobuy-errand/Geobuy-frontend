import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useCreateErrandMutation } from "../../redux/services/errandApi";
import AddressAutocomplete from "../../components/AddressAutocomplete";
import { toast } from "react-hot-toast";
import http from "../../services/http";
import useCountry from "../../hooks/useCountry";
import {
  FaCalendar,
  FaClock,
  FaCamera,
  FaInfoCircle,
  FaArrowRight,
  FaRuler,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock as FaClockIcon,
  FaDollarSign,
} from "react-icons/fa";

// ============================================================
// The price is calculated by the SERVER (/errands/quote) — the same code
// that charges the customer — so what you see is exactly what you pay,
// in £ for the UK and ₦ for Nigeria.
// ============================================================

const EMPTY_PRICE = {
  baseFee: 0,
  distanceFee: 0,
  distanceRate: 0,
  heavyItemFee: 0,
  waitTimeFee: 0,
  peakUrgentFee: 0,
  extraStopsFee: 0,
  subtotal: 0,
  discountPercentage: 0,
  discountAmount: 0,
  total: 0,
  platformFee: 0,
  providerAmount: 0,
};

const CreateBooking = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [createErrand, { isLoading }] = useCreateErrandMutation();
  const { code: countryCode, country, format, distanceUnitLabel } = useCountry();
  const unitShort = country.distanceUnit === "mi" ? "mile" : "km";

  // Public pricing for the customer's country (for option labels)
  const [pricing, setPricing] = useState(null);
  useEffect(() => {
    http
      .get(`/settings/public?country=${countryCode}`)
      .then((r) => setPricing(r.data.pricing))
      .catch(() => setPricing(null));
  }, [countryCode]);

  const HEAVY_ITEM_FEE = pricing?.heavyItemFee ?? 0;
  const WAIT_TIME_FEE_PER_MIN = pricing?.waitTimeFeePerMin ?? 0;
  const WAIT_TIME_FREE_MIN = pricing?.waitTimeFreeMin ?? 0;
  const PEAK_URGENT_FEE = pricing?.peakUrgentFee ?? 0;
  const EXTRA_STOP_FEE = pricing?.extraStopFee ?? 0;

  const [formData, setFormData] = useState({
    pickup: { address: "", street: "", area: "", town: "", state: "", postcode: "", instructions: "", coordinates: null },
    dropoff: { address: "", street: "", area: "", town: "", state: "", postcode: "", instructions: "", coordinates: null },
    taskDetails: "",
    preferredDate: "",
    preferredTime: "",
    requiresLiveTracking: false,
    isHeavyItem: false,
    isPeakUrgent: false,
    extraStopsCount: 0,
    waitTimeMinutes: 0,
  });

  const [hasDropoff, setHasDropoff] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [distance, setDistance] = useState(0);
  const [distanceText, setDistanceText] = useState("");
  const [durationText, setDurationText] = useState("");
  const [distanceAccuracy, setDistanceAccuracy] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [distanceError, setDistanceError] = useState(null);
  const [addressesValid, setAddressesValid] = useState({ pickup: false, dropoff: false });
  const [priceEstimate, setPriceEstimate] = useState(EMPTY_PRICE);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isDistanceCalculated, setIsDistanceCalculated] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const quoteSeq = useRef(0);

  const quotePayload = () => ({
    pickup: formData.pickup,
    dropoff: formData.dropoff,
    isHeavyItem: formData.isHeavyItem,
    isPeakUrgent: formData.isPeakUrgent,
    extraStopsCount: formData.extraStopsCount,
    waitTimeMinutes: formData.waitTimeMinutes,
  });

  // Ask the server for distance + price
  const fetchQuote = async () => {
    if (!formData.pickup.address || !formData.dropoff.address) return;
    const seq = ++quoteSeq.current;
    setIsCalculating(true);
    setDistanceError(null);
    try {
      const { data } = await http.post("/errands/quote", quotePayload());
      if (seq !== quoteSeq.current) return; // a newer quote is on its way
      const b = data.priceBreakdown;
      setDistance(b.distance.value);
      setDistanceText(b.distance.text);
      setDurationText(b.duration.text);
      setDistanceAccuracy(b.distance.accuracy);
      setIsSubscribed(Boolean(b.subscription?.isSubscribed));
      setPriceEstimate({
        baseFee: b.baseFee,
        distanceFee: b.distanceFee,
        distanceRate: b.distanceRate,
        heavyItemFee: b.additionalCharges.heavyItem || 0,
        waitTimeFee: b.additionalCharges.waitTime || 0,
        peakUrgentFee: b.additionalCharges.peakUrgent || 0,
        extraStopsFee: b.additionalCharges.extraStops || 0,
        subtotal: b.subtotal,
        discountPercentage: b.subscription?.discountPercentage || 0,
        discountAmount: b.subscription?.discountAmount || 0,
        total: b.total,
        platformFee: b.revenueSplit.geobuyFee,
        providerAmount: b.revenueSplit.providerAmount,
      });
      // Keep the coordinates the server resolved so creation uses the same points
      setFormData((prev) => ({
        ...prev,
        pickup: { ...prev.pickup, coordinates: prev.pickup.coordinates || data.pickup?.coordinates || null },
        dropoff: { ...prev.dropoff, coordinates: prev.dropoff.coordinates || data.dropoff?.coordinates || null },
      }));
      setAddressesValid({ pickup: true, dropoff: true });
      setIsDistanceCalculated(true);
    } catch (error) {
      if (seq !== quoteSeq.current) return;
      setIsDistanceCalculated(false);
      setDistance(0);
      setPriceEstimate(EMPTY_PRICE);
      setDistanceError(error.response?.data?.message || "We couldn't calculate this route. Please check both addresses.");
    } finally {
      if (seq === quoteSeq.current) setIsCalculating(false);
    }
  };

  useEffect(() => {
    if (user?.subscription?.isSubscribed) setIsSubscribed(true);
  }, [user]);

  // Re-quote when addresses or priced options change (debounced)
  useEffect(() => {
    if (!formData.pickup.address || !formData.dropoff.address) return undefined;
    const t = setTimeout(fetchQuote, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData.pickup.address,
    formData.dropoff.address,
    formData.pickup.coordinates,
    formData.dropoff.coordinates,
    formData.isHeavyItem,
    formData.isPeakUrgent,
    formData.extraStopsCount,
    formData.waitTimeMinutes,
  ]);

  const handleAddressSelect = (type, suggestion) => {
    const fullAddress = suggestion.displayName || "";
    const parts = fullAddress.split(",").map((p) => p.trim());
    const lng = suggestion.lng ?? suggestion.lon;
    setFormData((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        address: fullAddress,
        street: [suggestion.houseNumber, suggestion.road].filter(Boolean).join(" ") || parts[0] || "",
        area: suggestion.suburb || "",
        town: suggestion.city || parts[1] || "",
        state: suggestion.state || "",
        postcode: suggestion.postcode || "",
        coordinates: suggestion.lat && lng ? { lat: Number(suggestion.lat), lng: Number(lng) } : null,
      },
    }));
    setAddressesValid((prev) => ({ ...prev, [type]: true }));
  };

  const handleAddressChange = (type, valueOrEvent) => {
    let value = "";
    if (typeof valueOrEvent === "string") value = valueOrEvent;
    else if (valueOrEvent?.target?.value !== undefined) value = valueOrEvent.target.value;
    else value = String(valueOrEvent || "");

    setFormData((prev) => ({ ...prev, [type]: { ...prev[type], address: value, coordinates: null } }));
    setAddressesValid((prev) => ({ ...prev, [type]: Boolean(value.trim()) }));
    setIsDistanceCalculated(false);
    setDistance(0);
    setDistanceText("");
    setDurationText("");
    setDistanceError(null);
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const filePreviews = files.map((file) => URL.createObjectURL(file));
    setPhotos((prev) => [...prev, ...filePreviews]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.pickup.address) return toast.error("Please select a pickup address");
    if (!formData.dropoff.address) return toast.error("Please select a drop-off address");
    if (!formData.preferredDate || !formData.preferredTime) return toast.error("Please select date and time");
    if (!isDistanceCalculated) return toast.error("Please wait for the price to be calculated");

    try {
      // Photos are local previews only (blob: URLs) — don't send them
      const result = await createErrand({ ...formData }).unwrap();
      const errandId = result.errand._id;

      if (!result.paymentRequired) {
        toast.success("Errand created successfully!");
        navigate(`/customer/errand/${errandId}`);
        return;
      }

      // Pay now: redirect to Stripe (UK) or Paystack (Nigeria)
      setIsPaying(true);
      try {
        const { data } = await http.post("/payments/errand/checkout", { errandId });
        toast.success(`Errand created — redirecting to ${country.paymentGatewayLabel}...`);
        window.location.assign(data.url);
      } catch (payErr) {
        setIsPaying(false);
        toast.error(payErr.response?.data?.message || "Errand saved. Please complete payment from the booking page.");
        navigate(`/customer/booking/${errandId}`);
      }
    } catch (error) {
      console.error("Create errand error:", error);
      toast.error(error.data?.message || "Failed to create errand");
    }
  };

  const isFormReady = () =>
    !isLoading &&
    !isCalculating &&
    !isPaying &&
    Boolean(formData.pickup.address) &&
    Boolean(formData.dropoff.address) &&
    Boolean(formData.preferredDate) &&
    Boolean(formData.preferredTime) &&
    isDistanceCalculated &&
    addressesValid.pickup &&
    addressesValid.dropoff;

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">
        Create New Errand
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pickup Location */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">
            Pickup Location
          </h2>

          <AddressAutocomplete
            label="Full Address *"
            placeholder="Start typing your pickup address..."
            value={formData.pickup.address}
            onSelect={(suggestion) => handleAddressSelect("pickup", suggestion)}
            onChange={(e) => handleAddressChange("pickup", e)}
            required
            country={countryCode}
            minChars={2}
          />

          {addressesValid.pickup && (
            <div className="flex items-center text-green-600 text-sm mt-2">
              <FaCheckCircle className="mr-2" />
              <span>Address found in {country.name}</span>
            </div>
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium text-text-light mb-1">
              Special Instructions
            </label>
            <input
              type="text"
              name="pickup.instructions"
              value={formData.pickup.instructions}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  pickup: { ...prev.pickup, instructions: e.target.value },
                }));
              }}
              className="input-field"
              placeholder="e.g., Ring doorbell, leave with reception..."
            />
          </div>
        </div>

        {/* Dropoff Location */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text">
              Dropoff Location
            </h2>
            <button
              type="button"
              onClick={() => {
                setHasDropoff(!hasDropoff);
                if (!hasDropoff) {
                  setFormData((prev) => ({
                    ...prev,
                    dropoff: { ...prev.dropoff, address: "" },
                  }));
                  setAddressesValid((prev) => ({ ...prev, dropoff: false }));
                  setIsDistanceCalculated(false);
                  setDistance(0);
                }
              }}
              className="text-primary hover:underline text-sm"
            >
              {hasDropoff ? "Remove dropoff" : "Add dropoff"}
            </button>
          </div>

          {hasDropoff && (
            <>
              <AddressAutocomplete
                label="Destination Address *"
                placeholder="Start typing your dropoff address..."
                value={formData.dropoff.address}
                onSelect={(suggestion) =>
                  handleAddressSelect("dropoff", suggestion)
                }
                onChange={(e) => handleAddressChange("dropoff", e)}
                required
                country={countryCode}
                minChars={2}
              />

              {addressesValid.dropoff && (
                <div className="flex items-center text-green-600 text-sm mt-2">
                  <FaCheckCircle className="mr-2" />
                  <span>Address found in {country.name}</span>
                </div>
              )}

              <div className="mt-4">
                <label className="block text-sm font-medium text-text-light mb-1">
                  Special Instructions
                </label>
                <input
                  type="text"
                  name="dropoff.instructions"
                  value={formData.dropoff.instructions}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      dropoff: {
                        ...prev.dropoff,
                        instructions: e.target.value,
                      },
                    }));
                  }}
                  className="input-field"
                  placeholder="e.g., Leave at door, specific instructions..."
                />
              </div>
            </>
          )}
        </div>

        {/* Schedule */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Date *
              </label>
              <div className="relative">
                <FaCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
                <input
                  type="date"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      preferredDate: e.target.value,
                    }))
                  }
                  className="input-field pl-10"
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Time *
              </label>
              <div className="relative">
                <FaClock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
                <input
                  type="time"
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      preferredTime: e.target.value,
                    }))
                  }
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Options */}
        <div className="card">
          <button
            type="button"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="w-full flex items-center justify-between text-left"
          >
            <h2 className="text-lg font-semibold text-text">
              Additional Options
            </h2>
            <span className="text-primary text-sm">
              {showAdvancedOptions ? "Hide" : "Show"} options
            </span>
          </button>

          {showAdvancedOptions && (
            <div className="space-y-4 mt-4 pt-4 border-t border-gray-100">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.isHeavyItem}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isHeavyItem: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <div>
                  <span className="text-sm text-text-light">
                    Heavy Item (over 5kg/large)
                  </span>
                  <p className="text-xs text-text-lighter">
                    +{format(HEAVY_ITEM_FEE)}
                  </p>
                </div>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.isPeakUrgent}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isPeakUrgent: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <div>
                  <span className="text-sm text-text-light">Peak/Urgent</span>
                  <p className="text-xs text-text-lighter">
                    +{format(PEAK_URGENT_FEE)}
                  </p>
                </div>
              </label>

              <div>
                <label className="flex items-center space-x-3">
                  <span className="text-sm text-text-light">Extra Stops</span>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.extraStopsCount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        extraStopsCount: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-20 px-3 py-1 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                  <span className="text-xs text-text-lighter">
                    × {format(EXTRA_STOP_FEE)} each
                  </span>
                </label>
              </div>

              <div>
                <label className="flex items-center space-x-3">
                  <span className="text-sm text-text-light">
                    Expected Wait Time
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="240"
                    value={formData.waitTimeMinutes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        waitTimeMinutes: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-20 px-3 py-1 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                  <span className="text-xs text-text-lighter">
                    minutes (first {WAIT_TIME_FREE_MIN} free, then {format(WAIT_TIME_FEE_PER_MIN)}/min)
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Price Estimate */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text">Price Estimate</h2>
            {isDistanceCalculated && distanceAccuracy === "approximate" && (
              <span className="text-xs text-amber-600">Approximate route — add street names for an exact price</span>
            )}
          </div>

          <div className="space-y-4">
            {isCalculating ? (
              <div className="text-center py-8">
                <FaSpinner className="animate-spin text-primary text-3xl mx-auto mb-3" />
                <p className="text-text-light">Calculating distance...</p>
              </div>
            ) : distanceError ? (
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <div className="flex items-start space-x-3">
                  <FaExclamationTriangle className="text-red-600 mt-0.5" />
                  <div>
                    <p className="text-red-700 font-medium">
                      Distance Calculation Failed
                    </p>
                    <p className="text-red-600 text-sm">{distanceError}</p>
                  </div>
                </div>
              </div>
            ) : distance > 0 && isDistanceCalculated ? (
              <>
                {true && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center space-x-2">
                          <FaRuler className="text-primary" />
                          <span className="text-sm text-text-light">
                            Distance
                          </span>
                        </div>
                        <span className="text-lg font-bold text-text">
                          {distanceText}
                        </span>
                        <p className="text-xs text-text-lighter">
                          Avg rate: {format(priceEstimate.distanceRate)}/{unitShort}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center space-x-2">
                          <FaClockIcon className="text-primary" />
                          <span className="text-sm text-text-light">
                            Travel Time
                          </span>
                        </div>
                        <span className="text-lg font-bold text-text">
                          {durationText}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-text-light">Base Fee</span>
                        <span className="font-medium">
                          {format(priceEstimate.baseFee)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-light">
                          Distance Fee ({distance.toFixed(1)} {distanceUnitLabel})
                        </span>
                        <span className="font-medium">
                          {format(priceEstimate.distanceFee)}
                        </span>
                      </div>

                      {formData.isHeavyItem && (
                        <div className="flex justify-between text-orange-600">
                          <span>Heavy Item Fee</span>
                          <span>+{format(priceEstimate.heavyItemFee)}</span>
                        </div>
                      )}
                      {formData.waitTimeMinutes > 5 && (
                        <div className="flex justify-between text-orange-600">
                          <span>
                            Wait Time ({formData.waitTimeMinutes - 5} extra
                            mins)
                          </span>
                          <span>+{format(priceEstimate.waitTimeFee)}</span>
                        </div>
                      )}
                      {formData.isPeakUrgent && (
                        <div className="flex justify-between text-orange-600">
                          <span>Peak/Urgent Fee</span>
                          <span>
                            +{format(priceEstimate.peakUrgentFee)}
                          </span>
                        </div>
                      )}
                      {formData.extraStopsCount > 0 && (
                        <div className="flex justify-between text-orange-600">
                          <span>Extra Stops ({formData.extraStopsCount})</span>
                          <span>
                            +{format(priceEstimate.extraStopsFee)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="font-medium text-text">Subtotal</span>
                        <span className="font-semibold text-text">
                          {format(priceEstimate.subtotal)}
                        </span>
                      </div>
                    </div>

                    {isSubscribed && (
                      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-green-700">
                              🎉 Subscription Discount
                            </span>
                            <p className="text-xs text-green-600">20% off</p>
                          </div>
                          <span className="font-bold text-green-700">
                            -{format(priceEstimate.discountAmount)}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="bg-primary/5 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-text">
                          Total
                        </span>
                        <span className="text-2xl font-bold text-primary">
                          {format(priceEstimate.total)}
                        </span>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <h4 className="font-semibold text-text mb-2 flex items-center">
                        <FaDollarSign className="mr-2 text-blue-600" />
                        How It's Split
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-text-light">
                            GEOBUY Fee (20%)
                          </span>
                          <span className="font-medium text-blue-600">
                            {format(priceEstimate.platformFee)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-light">
                            Provider Amount (80%)
                          </span>
                          <span className="font-medium text-primary">
                            {format(priceEstimate.providerAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-text-light">
                <p>Select both pickup and dropoff locations</p>
                <p className="text-xs text-text-lighter mt-2">
                  Enter an address for both locations
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Task Details & Photos */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">
            Additional Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Task Details
              </label>
              <textarea
                name="taskDetails"
                value={formData.taskDetails}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    taskDetails: e.target.value,
                  }))
                }
                rows="3"
                className="input-field resize-none"
                placeholder="Describe your errand in detail..."
                maxLength="500"
              />
              <p className="text-xs text-text-lighter mt-1">
                {formData.taskDetails.length}/500 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Photos (Optional)
              </label>
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer btn-outline text-sm py-2">
                  <FaCamera className="inline mr-2" />
                  Upload Photos
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-sm text-text-light">
                  {photos.length} photos uploaded
                </span>
              </div>
              {photos.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Upload ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="requiresLiveTracking"
                checked={formData.requiresLiveTracking}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    requiresLiveTracking: e.target.checked,
                  }))
                }
                className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
              />
              <span className="text-sm text-text-light">
                Enable live tracking
              </span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isFormReady()}
          className={`w-full btn-primary flex items-center justify-center space-x-2 ${
            !isFormReady() ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <span>
            {isPaying
              ? "Redirecting to payment..."
              : isLoading
              ? "Creating..."
              : isDistanceCalculated
              ? `Book & pay ${format(priceEstimate.total)}`
              : "Create Errand"}
          </span>
          <FaArrowRight />
        </button>
        <p className="text-xs text-text-lighter text-center">
          You'll pay securely with {country.paymentGatewayLabel}. Your money is held by GEOBUY and only released to the
          runner when you confirm the errand is done.
        </p>
      </form>
    </div>
  );
};

export default CreateBooking;
