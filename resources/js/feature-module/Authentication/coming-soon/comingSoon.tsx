import { Link } from "react-router"
import ImageWithBasePath from "../../../components/imageWithBasePath"
import { useEffect, useState } from "react";


const ComingSoon = () => {
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
    
  return (
   <div className="container">
  {/* start row */}
  <div className="row justify-content-center align-items-center vh-100">
    <div className="col-md-8 d-flex align-items-center justify-content-center mx-auto p-4">
      <div className="card border-0 text-center mb-0">
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <ImageWithBasePath src="assets/img/logo.svg" alt="Coming Icon" />
          </div>
          <h3 className="text-body mb-2">Our Website is</h3>
          <h1 className="display-2 fw-bold mb-2">
            <span className="text-primary"> COMING </span> SOON{" "}
          </h1>
          <p className="text-dark mb-0">
            Please check back later, We are working hard to get <br />{" "}
            everything just right.
          </p>
          <div className="d-flex align-items-center justify-content-center my-4">
            <div className="d-flex flex-column justify-content-center border rounded count-box  me-2 me-sm-3">
              <h2 className="days mb-0">54</h2>
              <h5 className="text-body mb-0">Days</h5>
            </div>
            <div className="seperate-dot me-2 me-sm-3">:</div>
            <div className="d-flex flex-column justify-content-center border rounded count-box  me-2 me-sm-3">
              <h2 className="hours mb-0">10</h2>
              <h5 className="text-body mb-0">Hrs</h5>
            </div>
            <div className="seperate-dot me-2 me-sm-3">:</div>
            <div className="d-flex flex-column justify-content-center border rounded count-box  me-2 me-sm-3">
              <h2 className="minutes mb-0">47</h2>
              <h5 className="text-body mb-0">Min</h5>
            </div>
            <div className="seperate-dot me-2 me-sm-3">:</div>
            <div className="d-flex flex-column justify-content-center border rounded count-box ">
              <h2 className="seconds mb-0">{seconds}</h2>
              <h5 className="text-body mb-0">Sec</h5>
            </div>
          </div>
          <div className="mb-4">
            <h6 className="text-center mb-2">Subscribe to get notified!</h6>
            <div className="bg-white border p-1 d-flex align-items-center rounded ps-0">
              <input
                type="email"
                className="form-control border-0 shadow-none"
                placeholder="Enter Your Email"
              />
              <Link to="#" className="btn btn-dark">
                Subscribe
              </Link>
            </div>
          </div>
          <div className="d-flex flex-wrap justify-content-center align-items-center">
            <Link to="#" className="btn btn-dark btn-icon btn-sm me-2">
              <i className="ti ti-brand-facebook fs-16" />
            </Link>
            <Link to="#" className="btn btn-dark btn-icon btn-sm me-2">
              <i className="ti ti-brand-instagram fs-16" />
            </Link>
            <Link to="#" className="btn btn-dark btn-icon btn-sm me-2">
              <i className="ti ti-brand-twitter fs-16" />
            </Link>
            <Link to="#" className="btn btn-dark btn-icon btn-sm me-2">
              <i className="ti ti-brand-pinterest fs-16" />
            </Link>
            <Link to="#" className="btn btn-dark btn-icon btn-sm">
              <i className="ti ti-brand-linkedin fs-16" />
            </Link>
          </div>
        </div>{" "}
        {/* end card body */}
      </div>{" "}
      {/* end card */}
    </div>{" "}
    {/* end col */}
  </div>
  {/* end row */}
</div>

  )
}

export default ComingSoon