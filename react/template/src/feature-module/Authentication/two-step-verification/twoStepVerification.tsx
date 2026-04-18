import { Input } from "antd";
import ImageWithBasePath from "../../../components/imageWithBasePath"
import type { OTPProps } from "antd/es/input/OTP";
import { useEffect, useState } from "react";
import { all_routes } from "../../../routes/all_routes";
import { Link } from "react-router";


const TwoStepVerification = () => {
    const onChange: OTPProps["onChange"] = (text) => {
    console.log("onChange:", text);
  };

  const onInput: OTPProps["onInput"] = (value) => {
    console.log("onInput:", value);
  };
  const sharedProps: OTPProps = {
    onChange,
    onInput,
  };

  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    if (seconds <= 0) return;

    const intervalId = setInterval(() => {
      setSeconds((prevSeconds) => {
        if (prevSeconds <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prevSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [seconds]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes < 10 ? "0" + minutes : minutes}:${
      secs < 10 ? "0" + secs : secs
    }`;
  };

  return (
    <div className="overflow-hidden p-3 acc-vh">
  {/* start row */}
  <div className="row vh-100 w-100 g-0">
    <div className="col-lg-6 vh-100  overflow-y-auto overflow-x-hidden">
      {/* start row */}
      <div className="row">
        <div className="col-md-10 mx-auto">
          <form
            className=" vh-100 d-flex justify-content-between flex-column p-4 pb-0"
          >
            <div className="text-center mb-4 auth-logo">
              <ImageWithBasePath src="assets/img/logo.svg" className="img-fluid" alt="Logo" />
            </div>
            <div
              className="digit-group login-form-control"
              data-group-name="digits"
              data-autosubmit="false"
            >
              <div className="mb-4">
                <h4 className="mb-2 fs-20">Login With Your Email Address</h4>
                <p>
                  We sent a verification code to your email. Enter the code from
                  the email in the field below
                </p>
              </div>
              <div className="d-flex align-items-center justify-content-center gap-3 mb-4">
                <Input.OTP length={4} {...sharedProps} />
              </div>
              <div className="text-center mb-3">
                <p className="badge bg-light text-dark">
                  Otp will expire in {formatTime(seconds)}
                </p>
              </div>
              <div className="mb-3">
                <Link to={all_routes.login} className="btn btn-primary w-100">
                  Verify My Account
                </Link>
              </div>
            </div>
            <div className="text-center pb-4">
              <p className="text-dark mb-0">Copyright © {new Date().getFullYear()} - CRMS</p>
            </div>
          </form>
        </div>{" "}
        {/* end col */}
      </div>
      {/* end row */}
    </div>
    <div className="col-lg-6 account-bg-06" /> {/* end col */}
  </div>
  {/* end row */}
</div>

  )
}

export default TwoStepVerification