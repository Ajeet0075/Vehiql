"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { AlertCircle, Calendar } from "lucide-react";
import {
  Car,
  Fuel,
  Gauge,
  LocateFixed,
  Share2,
  Heart,
  MessageSquare,
  Currency,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toggleSavedCar } from "@/actions/car-listing";
import useFetch from "@/hooks/use-fetch";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/helper";
import EmiCalculator from "./emi-calculator";

const CarDetails = ({car, testDriveInfo}) => {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(car.wishlisted);

  const {
    loading: savingCar,
    fn: toggleSavedCarFn,
    data: toggleResult,
    error: toggleError,
  } = useFetch(toggleSavedCar);

  // Handle toggle result with useEffect
  useEffect(() => {
    if (toggleResult?.success) {
      setIsWishlisted(toggleResult.saved);
      toast.success(toggleResult.message);
    }
  }, [toggleResult]);

  // Handle errors with useEffect
  useEffect(() => {
    if (toggleError) {
      toast.error("Failed to update favorites");
    }
  }, [toggleError]);

  // Handle save car
  const handleSaveCar = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to save cars");
      router.push("/sign-in");
      return;
    }

    if (savingCar) return;

    // Use the toggleSavedCarFn from useFetch hook
    await toggleSavedCarFn(car.id);
  };

  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${car.year} ${car.make} ${car.model}`,
          text: `Check out this ${car.year} ${car.make} ${car.model} on Vehiql!`,
          url: window.location.href,
        })
        .catch((error) => {
          console.log("Error sharing", error);
          copyToClipboard();
        });
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

  // Handle book test drive
  const handleBookTestDrive = () => {
    if (!isSignedIn) {
      toast.error("Please sign in to book a test drive");
      router.push("/sign-in");
      return;
    }
    router.push(`/test-drive/${car.id}`);
  };

  return (
    <div>
        <div className="flex flex-col lg:flex-row gap-8">
        {/* Image Gallery */}
        <div className="w-full lg:w-7/12">
          <div className="aspect-video rounded-lg overflow-hidden relative mb-4">
            {car.images && car.images.length > 0 ? (
              <Image
                src={car.images[currentImageIndex]}
                alt={`${car.year} ${car.make} ${car.model}`}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Car className="h-24 w-24 text-gray-400" />
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {car.images && car.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {car.images.map((image, index) => (
                <div
                  key={index}
                  className={`relative cursor-pointer rounded-md h-20 w-24 flex-shrink-0 transition ${
                    index === currentImageIndex
                      ? "border-2 border-blue-600"
                      : "opacity-70 hover:opacity-100"
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <Image
                    src={image}
                    alt={`${car.year} ${car.make} ${car.model} - view ${
                      index + 1
                    }`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Secondary Actions */}
          <div className="flex mt-4 gap-4">
            <Button
              variant="outline"
              className={`flex items-center gap-2 flex-1 ${
                isWishlisted ? "text-red-500" : ""
              }`}
              onClick={handleSaveCar}
              disabled={savingCar}
            >
              <Heart
                className={`h-5 w-5 ${isWishlisted ? "fill-red-500" : ""}`}
              />
              {isWishlisted ? "Saved" : "Save"}
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 flex-1"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5" />
              Share
            </Button>
          </div>
        </div>

        {/* Car Details */}
        <div className="w-full lg:w-5/12">
          <div className="flex items-center justify-between">
            <Badge className="mb-2">{car.bodyType}</Badge>
          </div>

          <h1 className="text-4xl font-bold mb-1">
            {car.year} {car.make} {car.model}
          </h1>

          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(car.price)}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-6">
            <div className="flex items-center gap-2">
              <Gauge className="text-gray-500 h-5 w-5" />
              <span>{car.mileage.toLocaleString()} miles</span>
            </div>
            <div className="flex items-center gap-2">
              <Fuel className="text-gray-500 h-5 w-5" />
              <span>{car.fuelType}</span>
            </div>
            <div className="flex items-center gap-2">
              <Car className="text-gray-500 h-5 w-5" />
              <span>{car.transmission}</span>
            </div>
          </div>

          <Dialog>
            <DialogTrigger className="w-full text-start">
              <Card className="pt-5">
                <CardContent>
                  <div className="flex items-center gap-2 text-lg font-medium mb-2">
                    <Currency className="h-5 w-5 text-blue-600" />
                    <h3>EMI Calculator</h3>
                  </div>
                  <div className="text-sm text-gray-600">
                    Estimated Monthly Payment:{" "}
                    <span className="font-bold text-gray-900">
                      {formatCurrency(car.price / 60)}
                    </span>{" "}
                    for 60 months
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    *Based on $0 down payment and 4.5% interest rate
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Vehiql Car Loan Calculator</DialogTitle>
                <EmiCalculator price={car.price} />
              </DialogHeader>
            </DialogContent>
          </Dialog>

          {/* Request More Info */}
          <Card className="my-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-lg font-medium mb-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <h3>Have Questions?</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Our representatives are available to answer all your queries
                about this vehicle.
              </p>
              <a href="mailto:help@vehiql.in">
                <Button variant="outline" className="w-full">
                  Request Info
                </Button>
              </a>
            </CardContent>
          </Card>

          {(car.status === "SOLD" || car.status === "UNAVAILABLE") && (
            <Alert variant="destructive">
              <AlertTitle className="capitalize">
                This car is {car.status.toLowerCase()}
              </AlertTitle>
              <AlertDescription>Please check again later.</AlertDescription>
            </Alert>
          )}

          {/* Book Test Drive Button */}
          {car.status !== "SOLD" && car.status !== "UNAVAILABLE" && (
            <Button
              className="w-full py-6 text-lg"
              onClick={handleBookTestDrive}
              disabled={testDriveInfo.userTestDrive}
            >
              <Calendar className="mr-2 h-5 w-5" />
              {testDriveInfo.userTestDrive
                ? `Booked for ${format(
                    new Date(testDriveInfo.userTestDrive.bookingDate),
                    "EEEE, MMMM d, yyyy"
                  )}`
                : "Book Test Drive"}
            </Button>
          )}
        </div>
      </div>
      {/* Details & Features Section */}
    <div className="mt-16 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
    
    {/* Description */}
    <div>
      <h3 className="text-3xl font-semibold mb-4 text-gray-800">📄 Description</h3>
      <p className="text-gray-600 text-base leading-relaxed whitespace-pre-line">
        {car.description}
      </p>
    </div>

    {/* Features */}
    <div>
      <h3 className="text-3xl font-semibold mb-4 text-gray-800">🛠️ Features</h3>
      <ul className="grid grid-cols-1 gap-4">
        <li className="flex items-center gap-3 text-gray-700">
          <span className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></span>
          <span className="font-medium">{car.transmission}</span> Transmission
        </li>
        <li className="flex items-center gap-3 text-gray-700">
          <span className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></span>
          <span className="font-medium">{car.fuelType}</span> Engine
        </li>
        <li className="flex items-center gap-3 text-gray-700">
          <span className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></span>
          <span className="font-medium">{car.bodyType}</span> Body Style
        </li>
        {car.seats && (
          <li className="flex items-center gap-3 text-gray-700">
            <span className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></span>
            <span className="font-medium">{car.seats}</span> Seats
          </li>
        )}
        <li className="flex items-center gap-3 text-gray-700">
          <span className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></span>
          <span className="font-medium capitalize">{car.color}</span> Exterior
        </li>
      </ul>
      </div>
    </div>
    </div>

    {/* Specifications Section */}
<div className="mt-16 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
  <h2 className="text-3xl font-semibold mb-8 text-gray-800">📋 Specifications</h2>

  <div className="bg-gray-50 rounded-xl p-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
      {/* Spec Row - helper function pattern for reuse */}
      {[
        ["Make", car.make],
        ["Model", car.model],
        ["Year", car.year],
        ["Body Type", car.bodyType],
        ["Fuel Type", car.fuelType],
        ["Transmission", car.transmission],
        ["Mileage", `${car.mileage.toLocaleString()} miles`],
        ["Color", car.color],
        ["Seats", car.seats]
      ].map(
        ([label, value], index) =>
          value && (
            <div
              key={label}
              className="flex items-center justify-between px-4 py-3 bg-white rounded-lg shadow-sm hover:shadow-md transition"
            >
              <span className="text-gray-600 font-medium">{label}</span>
              <span className="text-gray-900 font-semibold">{value}</span>
            </div>
          )
      )}
    </div>
  </div>
</div>

{/* Dealership Location Section */}
<div className="mt-16 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
  <h2 className="text-3xl font-semibold mb-8 text-gray-800"> Dealership Location</h2>

  <div className="bg-gray-50 rounded-xl p-6 space-y-6">
    <div className="flex flex-col md:flex-row gap-8 justify-between">
      
      {/* Dealership Info */}
      <div className="flex items-start gap-4 md:flex-1">
        <div className="mt-1 text-blue-600">
          <LocateFixed className="h-6 w-6" />
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-1">Vehiql Motors</h4>
          <p className="text-gray-700">
            {testDriveInfo.dealership?.address || "Not Available"}
          </p>
          <p className="text-gray-700 mt-2">
            📞 <span className="font-medium">{testDriveInfo.dealership?.phone || "Not Available"}</span>
          </p>
          <p className="text-gray-700">
            ✉️ <span className="font-medium">{testDriveInfo.dealership?.email || "Not Available"}</span>
          </p>
        </div>
      </div>

      {/* Working Hours */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:w-1/2 lg:w-1/3 border border-gray-100">
        <h4 className="text-lg font-semibold mb-4">🕒 Working Hours</h4>
        <div className="space-y-2 text-sm">
          {testDriveInfo.dealership?.workingHours
            ? testDriveInfo.dealership.workingHours
                .sort((a, b) => {
                  const days = [
                    "MONDAY",
                    "TUESDAY",
                    "WEDNESDAY",
                    "THURSDAY",
                    "FRIDAY",
                    "SATURDAY",
                    "SUNDAY",
                  ];
                  return days.indexOf(a.dayOfWeek) - days.indexOf(b.dayOfWeek);
                })
                .map((day) => (
                  <div key={day.dayOfWeek} className="flex justify-between">
                    <span className="text-gray-600 font-medium">
                      {day.dayOfWeek.charAt(0) + day.dayOfWeek.slice(1).toLowerCase()}
                    </span>
                    <span className="text-gray-900">
                      {day.isOpen ? `${day.openTime} - ${day.closeTime}` : "Closed"}
                    </span>
                  </div>
                ))
            : // Default
              [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map((day, index) => (
                <div key={day} className="flex justify-between">
                  <span className="text-gray-600 font-medium">{day}</span>
                  <span className="text-gray-900">
                    {index < 5 ? "9:00 - 18:00" : index === 5 ? "10:00 - 16:00" : "Closed"}
                  </span>
                </div>
              ))}
        </div>
      </div>
    </div>
  </div>
</div>
    </div>
  )
}

export default CarDetails