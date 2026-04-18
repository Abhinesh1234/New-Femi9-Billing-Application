
import { all_routes } from '../../../../routes/all_routes'
import { Link } from 'react-router'
import { useEffect } from 'react'
import Swal from 'sweetalert2'

const UiSweetAlerts = () => {
  useEffect(() => {
    // Basic Message
    const basicBtn = document.getElementById('sweetalert-basic')
    if (basicBtn) {
      basicBtn.addEventListener('click', () => {
        Swal.fire('Hello world!')
      })
    }

    // Title with Text
    const titleBtn = document.getElementById('sweetalert-title')
    if (titleBtn) {
      titleBtn.addEventListener('click', () => {
        Swal.fire(
          'Here\'s a title!',
          'And here\'s some text under the title.',
          'info'
        )
      })
    }

    // HTML Content
    const htmlBtn = document.getElementById('custom-html-alert')
    if (htmlBtn) {
      htmlBtn.addEventListener('click', () => {
        Swal.fire({
          title: '<strong>HTML <u>example</u></strong>',
          icon: 'info',
          html: 'You can use <b>bold text</b>, ' +
            '<a href="//sweetalert2.github.io">links</a> ' +
            'and other HTML tags',
          showCloseButton: true,
          showCancelButton: true,
          focusConfirm: false,
          confirmButtonText: '<i class="fa fa-thumbs-up"></i> Great!',
          confirmButtonAriaLabel: 'Thumbs up, great!',
          cancelButtonText: '<i class="fa fa-thumbs-down"></i>',
          cancelButtonAriaLabel: 'Thumbs down'
        })
      })
    }

    // Info Alert
    const infoBtn = document.getElementById('sweetalert-info')
    if (infoBtn) {
      infoBtn.addEventListener('click', () => {
        Swal.fire('Info!', 'This is an info message.', 'info')
      })
    }

    // Warning Alert
    const warningBtn = document.getElementById('sweetalert-warning')
    if (warningBtn) {
      warningBtn.addEventListener('click', () => {
        Swal.fire('Warning!', 'This is a warning message.', 'warning')
      })
    }

    // Error Alert
    const errorBtn = document.getElementById('sweetalert-error')
    if (errorBtn) {
      errorBtn.addEventListener('click', () => {
        Swal.fire('Error!', 'This is an error message.', 'error')
      })
    }

    // Success Alert
    const successBtn = document.getElementById('sweetalert-success')
    if (successBtn) {
      successBtn.addEventListener('click', () => {
        Swal.fire('Success!', 'This is a success message.', 'success')
      })
    }

    // Question Alert
    const questionBtn = document.getElementById('sweetalert-question')
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        Swal.fire('Question!', 'This is a question message.', 'question')
      })
    }

    // Long Content
    const longContentBtn = document.getElementById('sweetalert-longcontent')
    if (longContentBtn) {
      longContentBtn.addEventListener('click', () => {
        Swal.fire({
          title: 'Long content example',
          html: `
            <div style="text-align: left;">
              <p>This is a very long content example that demonstrates how SweetAlert handles large amounts of text.</p>
              <p>You can include multiple paragraphs, lists, and other HTML elements.</p>
              <ul>
                <li>First item in the list</li>
                <li>Second item in the list</li>
                <li>Third item in the list</li>
                <li>Fourth item in the list</li>
                <li>Fifth item in the list</li>
              </ul>
              <p>This content will automatically adjust the modal size and provide scrolling if needed.</p>
            </div>
          `,
          width: '600px'
        })
      })
    }

    // Confirm Button
    const confirmBtn = document.getElementById('sweetalert-confirm-button')
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        Swal.fire({
          title: 'Are you sure?',
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!'
        }).then((result: any) => {
          if (result.isConfirmed) {
            Swal.fire(
              'Deleted!',
              'Your file has been deleted.',
              'success'
            )
          }
        })
      })
    }

    // Cancel Button
    const cancelBtn = document.getElementById('sweetalert-params')
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        Swal.fire({
          title: 'Are you sure?',
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!'
        }).then((result: any) => {
          if (result.isConfirmed) {
            Swal.fire(
              'Deleted!',
              'Your file has been deleted.',
              'success'
            )
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire(
              'Cancelled',
              'Your imaginary file is safe :)',
              'error'
            )
          }
        })
      })
    }

    // Image Header
    const imageBtn = document.getElementById('sweetalert-image')
    if (imageBtn) {
      imageBtn.addEventListener('click', () => {
        Swal.fire({
          title: 'Sweet!',
          text: 'Modal with a custom image.',
          imageUrl: 'https://unsplash.it/400/200',
          imageWidth: 400,
          imageHeight: 200,
          imageAlt: 'Custom image'
        })
      })
    }

    // Auto Close
    const autoCloseBtn = document.getElementById('sweetalert-close')
    if (autoCloseBtn) {
      autoCloseBtn.addEventListener('click', () => {
        let timerInterval: NodeJS.Timeout
        Swal.fire({
          title: 'Auto close alert!',
          html: 'I will close in <b></b> milliseconds.',
          timer: 2000,
          timerProgressBar: true,
          didOpen: () => {
            const htmlContainer = Swal.getHtmlContainer();
            const b = htmlContainer ? htmlContainer.querySelector('b') : null;
            timerInterval = setInterval(() => {
              if (b) {
                b.textContent = Swal.getTimerLeft()?.toString() || '0';
              }
            }, 100)
          },
          willClose: () => {
            clearInterval(timerInterval)
          }
        }).then((result: any) => {
          if (result.dismiss === Swal.DismissReason.timer) {
            console.log('I was closed by the timer')
          }
        })
      })
    }

    // Position - Top Start
    const topStartBtn = document.getElementById('position-top-start')
    if (topStartBtn) {
      topStartBtn.addEventListener('click', () => {
        Swal.fire({
          position: 'top-start',
          icon: 'success',
          title: 'Your work has been saved',
          showConfirmButton: false,
          timer: 1500
        })
      })
    }

    // Position - Top End
    const topEndBtn = document.getElementById('position-top-end')
    if (topEndBtn) {
      topEndBtn.addEventListener('click', () => {
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Your work has been saved',
          showConfirmButton: false,
          timer: 1500
        })
      })
    }

    // Position - Bottom Start
    const bottomStartBtn = document.getElementById('position-bottom-start')
    if (bottomStartBtn) {
      bottomStartBtn.addEventListener('click', () => {
        Swal.fire({
          position: 'bottom-start',
          icon: 'success',
          title: 'Your work has been saved',
          showConfirmButton: false,
          timer: 1500
        })
      })
    }

    // Position - Bottom End
    const bottomEndBtn = document.getElementById('position-bottom-end')
    if (bottomEndBtn) {
      bottomEndBtn.addEventListener('click', () => {
        Swal.fire({
          position: 'bottom-end',
          icon: 'success',
          title: 'Your work has been saved',
          showConfirmButton: false,
          timer: 1500
        })
      })
    }

    // Custom Padding and Background
    const customPaddingBtn = document.getElementById('custom-padding-width-alert')
    if (customPaddingBtn) {
      customPaddingBtn.addEventListener('click', () => {
        Swal.fire({
          title: 'Custom width, padding, background.',
          width: 600,
          padding: '3em',
          background: '#fff url(https://sweetalert2.github.io/images/trees.png)',
          backdrop: `
            rgba(0,0,123,0.4)
            url("https://sweetalert2.github.io/images/nyan-cat.gif")
            left top
            no-repeat
          `
        })
      })
    }

    // Ajax Request
    const ajaxBtn = document.getElementById('ajax-alert')
    if (ajaxBtn) {
      ajaxBtn.addEventListener('click', () => {
        Swal.fire({
          title: 'Submit your Github username',
          input: 'text',
          inputAttributes: {
            autocapitalize: 'off',
            autocorrect: 'off'
          },
          showCancelButton: true,
          confirmButtonText: 'Look up',
          showLoaderOnConfirm: true,
          preConfirm: (login: string) => {
            return fetch(`//api.github.com/users/${login}`)
              .then(response => {
                if (!response.ok) {
                  throw new Error(response.statusText)
                }
                return response.json()
              })
              .catch(error => {
                Swal.showValidationMessage(
                  `Request failed: ${error}`
                )
              })
          },
          allowOutsideClick: () => !Swal.isLoading()
        }).then((result: any) => {
          if (result.isConfirmed) {
            Swal.fire({
              title: `${result.value.login}'s avatar`,
              imageUrl: result.value.avatar_url
            })
          }
        })
      })
    }

    // Cleanup function
    return () => {
      // Remove event listeners if needed
      const buttons = [
        'sweetalert-basic', 'sweetalert-title', 'custom-html-alert',
        'sweetalert-info', 'sweetalert-warning', 'sweetalert-error',
        'sweetalert-success', 'sweetalert-question', 'sweetalert-longcontent',
        'sweetalert-confirm-button', 'sweetalert-params', 'sweetalert-image',
        'sweetalert-close', 'position-top-start', 'position-top-end',
        'position-bottom-start', 'position-bottom-end', 'custom-padding-width-alert',
        'ajax-alert'
      ]
      
      buttons.forEach(id => {
        const element = document.getElementById(id)
        if (element) {
          element.removeEventListener('click', () => {})
        }
      })
    }
  }, [])

  return (
    <>
  {/* ========================
			Start Page Content
		========================= */}
  <div className="page-wrapper">
    {/* Start Content */}
    <div className="content pb-0">
      {/* Page Header */}
      <div className="mb-4">
        <h4 className="mb-1">Sweet Alert 2</h4>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0 p-0">
            <li className="breadcrumb-item">
              <Link to={all_routes.dealsDashboard}>Home</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="#">Advanced UI</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Sweet Alert 2
            </li>
          </ol>
        </nav>
      </div>
      {/* End Page Header */}
      {/* start row */}
      <div className="row">
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header border-bottom d-flex align-items-center">
              <h4 className="header-title">A Basic Message</h4>
            </div>
            <div className="card-body">
              <p className="text-muted">
                Here's a basic example of SweetAlert.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                id="sweetalert-basic"
              >
                Click me
              </button>
            </div>{" "}
            {/* end card-body */}
          </div>{" "}
          {/* end card */}
        </div>{" "}
        {/* end col */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header border-bottom d-flex align-items-center">
              <h4 className="header-title">Title</h4>
            </div>
            <div className="card-body">
              <p className="text-muted">A Title with a Text Under.</p>
              <button
                type="button"
                className="btn btn-primary"
                id="sweetalert-title"
              >
                Click Me
              </button>
            </div>{" "}
            {/* end card-body */}
          </div>{" "}
          {/* end card */}
        </div>{" "}
        {/* end col */}
        <div className="col-lg-6">
          <div className="card card-h-100">
            <div className="card-header border-bottom d-flex align-items-center">
              <h4 className="header-title">HTML</h4>
            </div>
            <div className="card-body">
              <p className="text-muted">
                Here's an example of SweetAlert with HTML content.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                id="custom-html-alert"
              >
                Toggle HTML SweetAlert
              </button>
            </div>{" "}
            {/* end card-body */}
          </div>{" "}
          {/* end card */}
        </div>{" "}
        {/* end col */}
        <div className="col-lg-6">
          <div className="card card-h-100">
            <div className="card-header border-bottom d-flex align-items-center">
              <h4 className="header-title">All States</h4>
            </div>
            <div className="card-body">
              <p className="text-muted">
                Here are examples for each of SweetAlert's states.
              </p>
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  id="sweetalert-info"
                  className="btn btn-info"
                >
                  Toggle Info
                </button>
                <button
                  type="button"
                  id="sweetalert-warning"
                  className="btn btn-warning"
                >
                  Toggle Warning
                </button>
                <button
                  type="button"
                  id="sweetalert-error"
                  className="btn btn-danger"
                >
                  Toggle Error
                </button>
                <button
                  type="button"
                  id="sweetalert-success"
                  className="btn btn-success"
                >
                  Toggle Success
                </button>
                <button
                  type="button"
                  id="sweetalert-question"
                  className="btn btn-primary"
                >
                  Toggle Question
                </button>
              </div>
            </div>{" "}
            {/* end card-body */}
          </div>{" "}
          {/* end card */}
        </div>{" "}
        {/* end col */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header border-bottom d-flex align-items-center">
              <h4 className="header-title">Long Content</h4>
            </div>
            <div className="card-body">
              <p className="text-muted">
                A modal window with a long content inside.
              </p>
              <button
                type="button"
                id="sweetalert-longcontent"
                className="btn btn-secondary"
              >
                Click Me
              </button>
            </div>{" "}
            {/* end card-body */}
          </div>{" "}
          {/* end card */}
        </div>{" "}
        {/* end col */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header border-bottom d-flex align-items-center">
              <h4 className="header-title">With Confirm Button</h4>
            </div>
            <div className="card-body">
              <p className="text-muted">
                A warning message, with a function attached to the
                "Confirm"-button...
              </p>
              <button
                type="button"
                id="sweetalert-confirm-button"
                className="btn btn-secondary"
              >
                Click Me
              </button>
            </div>{" "}
            {/* end card-body */}
          </div>{" "}
          {/* end card */}
        </div>{" "}
        {/* end col */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header border-bottom d-flex align-items-center">
              <h4 className="header-title">With Cancel Button</h4>
            </div>
            <div className="card-body">
              <p className="text-muted">
                By passing a parameter, you can execute something else for
                "Cancel".
              </p>
              <button
                type="button"
                id="sweetalert-params"
                className="btn btn-secondary"
              >
                Click Me
              </button>
            </div>{" "}
            {/* end card-body */}
          </div>{" "}
          {/* end card */}
        </div>{" "}
        {/* end col */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header border-bottom d-flex align-items-center">
              <h4 className="header-title">With Image Header (Logo)</h4>
            </div>
            <div className="card-body">
              <p className="text-muted">A message with custom Image Header.</p>
              <button
                type="button"
                id="sweetalert-image"
                className="btn btn-secondary"
              >
                Click Me
              </button>
            </div>{" "}
            {/* end card-body */}
          </div>{" "}
          {/* end card */}
        </div>{" "}
        {/* end col */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header border-bottom d-flex align-items-center">
              <h4 className="header-title">Auto Close</h4>
            </div>
            <div className="card-body">
              <p className="text-muted">A message with auto close timer.</p>
              <button
                type="button"
                id="sweetalert-close"
                className="btn btn-secondary"
              >
                Click Me
              </button>
            </div>{" "}
            {/* end card-body */}
          </div>{" "}
          {/* end card */}
        </div>{" "}
        {/* end col */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header border-bottom d-flex align-items-center">
              <h4 className="header-title">Position</h4>
            </div>
            <div className="card-body">
              <p className="text-muted">A custom positioned dialog.</p>
              <div className="d-flex flex-wrap gap-2">
                <button className="btn btn-primary" id="position-top-start">
                  Top Start
                </button>
                <button className="btn btn-primary" id="position-top-end">
                  Top End
                </button>
                <button className="btn btn-primary" id="position-bottom-start">
                  Bottom Starts
                </button>
                <button className="btn btn-primary" id="position-bottom-end">
                  Bottom End
                </button>
              </div>
            </div>{" "}
            {/* end card-body */}
          </div>{" "}
          {/* end card */}
        </div>{" "}
        {/* end col */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header border-bottom d-flex align-items-center">
              <h4 className="header-title">With Custom Padding, Background</h4>
            </div>
            <div className="card-body">
              <p className="text-muted">
                A message with custom width, padding and background.
              </p>
              <button
                type="button"
                id="custom-padding-width-alert"
                className="btn btn-secondary"
              >
                Click Me
              </button>
            </div>{" "}
            {/* end card-body */}
          </div>{" "}
          {/* end card */}
        </div>{" "}
        {/* end col */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header border-bottom d-flex align-items-center">
              <h4 className="header-title">Ajax Request</h4>
            </div>
            <div className="card-body">
              <p className="text-muted">Ajax request example.</p>
              <button
                type="button"
                id="ajax-alert"
                className="btn btn-secondary"
              >
                Click Me
              </button>
            </div>{" "}
            {/* end card-body */}
          </div>{" "}
          {/* end card */}
        </div>{" "}
        {/* end col */}
      </div>
      {/* end row */}
    </div>
    {/* End Content */}
    {/* Start Footer */}
    <footer className="footer d-block d-md-flex justify-content-between text-md-start text-center">
      <p className="mb-md-0 mb-1">
        Copyright ©{" "}
        <Link
          to="javascript:void(0);"
          className="link-primary text-decoration-underline"
        >
          CRMS
        </Link>
      </p>
      <div className="d-flex align-items-center gap-2 footer-links justify-content-center justify-content-md-end">
        <Link to="javascript:void(0);">About</Link>
        <Link to="javascript:void(0);">Terms</Link>
        <Link to="javascript:void(0);">Contact Us</Link>
      </div>
    </footer>
    {/* End Footer */}
  </div>
  {/* ========================
			End Page Content
		========================= */}
</>

  )
}

export default UiSweetAlerts