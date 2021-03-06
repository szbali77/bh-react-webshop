import React, { Component } from 'react';
import ErrorDisplay from '../ErrorDisplay/ErrorDisplay';
import { Form, Container, Button } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { addNewProduct } from '../../actions/Actions';

class UploadProductForm extends Component {
  constructor(props) {
    super(props);
    this.fileInput = React.createRef();
    this.state = {
      product: {},
      errors: [],
      missingFields: [],
      uploaded: false,
    };
  }

  uploadData = async () => {
    const formData = new FormData();
    for (let i = 0; i < this.fileInput.current.files.length; i++) {
      formData.append('images', this.fileInput.current.files[i]);
    }
    formData.append('sku', this.state.product.sku);
    formData.append('name', this.state.product.name);
    formData.append('price', this.state.product.price);
    formData.append('desc', this.state.product.desc);
    formData.append('spec', this.state.product.spec);
    const result = await fetch('http://localhost:5000/product', {
      method: 'POST',
      mode: 'cors',
      body: formData,
    });

    if (result.ok) {
      const results = await result.json();
      if (results.errors) {
        this.setState((prevState) => ({
          ...prevState,
          errors: results.errors
            ? [...prevState.errors, ...results.errors]
            : [],
          product: results.productData
            ? { ...prevState.product, ...results.productData }
            : {},
          missingFields: results.missingFields
            ? [...prevState.missingFields, ...results.missingFields]
            : [],
        }));
        return;
      }

      this.setState((prevState) => ({
        ...prevState,
        product: {},
        errors: [],
        missingFields: [],
        uploaded: true,
      }));

      this.props.addProduct(results);
    } else {
      this.setState((prevState) => ({
        ...prevState,
        errors: [...prevState, { message: result.statusText }],
      }));
    }
  };

  validate = (e) => {
    let validate = true;
    e.preventDefault();
    const specs = document.querySelector('.specs');
    const specText = specs.value;

    if (specs.value && !specText.includes('=')) {
      this.setState((prevState) => ({
        ...prevState,
        errors: [
          ...prevState.errors,
          {
            type: 'validation',
            message: 'Product specs must include a "=" character!',
          },
        ],
      }));
      validate = false;
    }

    if (validate) {
      this.uploadData();
    }
  };

  handleSKUInput = (e) => {
    const regex = new RegExp('^[a-zA-Z0-9]*$');
    const key = String.fromCharCode(e.charCode);
    if (!regex.test(key)) {
      e.preventDefault();
    }
  };

  handleSpecsInput = (e) => {
    const key = String.fromCharCode(e.charCode);
    if (key === ' ') {
      e.preventDefault();
    }
  };

  handleChange = (evt) => {
    this.setState({
      ...this.state,
      product: {
        ...this.state.product,
        [evt.target.name]: evt.target.value,
      },
    });
  };

  render() {
    return (
      <Container className="p-3">
        <Form
          className="Upload-form"
          onSubmit={this.validate}
          encType="multipart/form-data"
        >
          <Form.Group>
            <Form.Label>SKU</Form.Label>
            <Form.Control
              className="sku"
              type="text"
              name="sku"
              onKeyPress={this.handleSKUInput}
              maxLength="12"
              defaultValue={
                Object.keys(this.props.productData).length
                  ? this.props.productData.sku
                  : ''
              }
              onChange={this.handleChange}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Product name:</Form.Label>
            <Form.Control
              className="name"
              type="text"
              name="name"
              defaultValue={
                Object.keys(this.props.productData).length
                  ? this.props.productData.name
                  : ''
              }
              onChange={this.handleChange}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Product price:</Form.Label>
            <Form.Control
              className="price"
              type="number"
              name="price"
              defaultValue={
                Object.keys(this.props.productData).length
                  ? this.props.productData.price
                  : ''
              }
              onChange={this.handleChange}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Product description:</Form.Label>
            <Form.Control
              className="desc"
              as="textarea"
              name="desc"
              maxLength="240"
              defaultValue={
                Object.keys(this.props.productData).length
                  ? this.props.productData.desc
                  : ''
              }
              onChange={this.handleChange}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Product specifications:</Form.Label>{' '}
            <span id="specsErr" className="d-none error"></span>
            <Form.Control
              className="specs"
              as="textarea"
              name="spec"
              required
              onKeyPress={this.handleSpecsInput}
              defaultValue={
                Object.keys(this.props.productData).length
                  ? this.props.productData.specs
                  : ''
              }
              onChange={this.handleChange}
            />
          </Form.Group>
          <Form.Group>
            <Form.File
              id="custom-file"
              label="Images"
              multiple
              custom
              name="images"
              ref={this.fileInput}
            />
          </Form.Group>
          <Form.Group className="text-right">
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form.Group>
        </Form>
        <ErrorDisplay
          errors={this.state.errors}
          missingFields={this.state.missingFields}
        />
        {this.state.uploaded && <Redirect to="/products" />}
      </Container>
    );
  }
}

function mapStateToProps(state) {
  return {
    productData: state.productData,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addProduct: (newProduct) => dispatch(addNewProduct(newProduct)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UploadProductForm);
