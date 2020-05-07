const fs = require('fs');
const formidable = require('formidable');

class ProductController {
	static addProduct(options) {
		const productService = options.productService;
		const skuService = options.skuService;
		const imageService = options.imageService;

		return async (req, res) => {
			try {
				const form = formidable({ multiples: true });

				form.parse(req, async (err, fields, files) => {
					let newSku = '';
					const newProduct = {};
					const images = [];
					const missingFields = [];
					if (err) {
						console.error(err);
						throw {
							errors: [
								{
									message: `Form data parse error: ${err.toString()}`,
								},
							],
							productData: {
								...fields,
							},
						};
					}
					const { sku, name, price, desc, spec } = fields;

					if (!name) missingFields.push('Name');
					if (isNaN(Number(price))) missingFields.push('Price');
					if (!spec) missingFields.push('Specs');
					if (missingFields.length)
						throw { missingFields, productData: { ...fields } };

					if (desc.length >= 240) {
						throw {
							errors: [
								{
									type: 'validation',
									message:
										'Description must be below 240 character long!',
								},
							],
							productData: { ...fields },
						};
					}

					newProduct.price = price;

					if (spec.includes(' ')) {
						throw {
							errors: [
								{
									type: 'validation',
									message: 'Spaces not allowed in specs!',
								},
							],
							productData: { ...fields },
						};
					}

					newProduct.name = name;
					newProduct.desc = desc;
					newProduct.specs = spec;
					if (!sku) {
						newSku = skuService.generateSKU(name.toUpperCase());
						if (skuService.checkSKUExists(newSku)) {
							throw {
								errors: [
									{
										message: 'SKU allready exists!',
									},
								],
								productData: { ...fields },
							};
						}
						newProduct.sku = newSku;
					} else {
						if (skuService.checkSKUExists(sku)) {
							throw {
								errors: [
									{
										message: 'SKU allready exists!',
									},
								],
								productData: { ...fields },
							};
						}
						newProduct.sku = sku.toUpperCase();
					}

					if (sku.length > 12) {
						throw {
							errors: [
								{
									type: 'validation',
									message:
										'SKU must be below 12 character long!',
								},
							],
							productData: { ...fields },
						};
					}

					try {
						let imageSrc = 'http://localhost:5000/img/';
						if (!sku) {
							fs.mkdirSync(
								`./static/img/${newSku.toUpperCase()}`
							);
							imageSrc += newSku;
						} else {
							fs.mkdirSync(`./static/img/${sku.toUpperCase()}`);
							imageSrc += sku.toUpperCase();
						}

						if (files.images instanceof Array) {
							files.images.forEach((f) => {
								images.push(imageSrc + '/' + f.name);
								if (!sku) {
									fs.copyFileSync(
										f.path,
										`./static/img/${newSku}/${f.name}`,
										(err) => {
											throw {
												errors: [
													{
														message: `File upload error: ${err.toString()}`,
													},
												],
												productData: { ...fields },
											};
										}
									);
									return;
								}

								fs.copyFileSync(
									f.path,
									`./static/img/${sku}/${f.name}`,
									(err) => {
										throw {
											errors: [
												{
													message: `File upload error: ${err.toString()}`,
												},
											],
											productData: { ...fields },
										};
									}
								);
							});

							const productResult = await productService.addProductToDB(
								newProduct
							);

							const imageResults = await imageService.addImagesToDb(
								{
									sku: productResult.sku,
									images,
								}
							);

							res.json({
								product: { ...productResult },
								images: imageResults,
							});
						} else {
							if (files.images.name) {
								if (!sku) {
									fs.copyFileSync(
										files.images.path,
										`./static/img/${newSku}/${files.images.name}`,
										(err) => {
											throw {
												errors: [
													{
														message: `File upload error: ${err.toString()}`,
													},
												],
												productData: { ...fields },
											};
										}
									);
								} else {
									fs.copyFileSync(
										files.images.path,
										`./static/img/${sku}/${files.images.name}`,
										(err) => {
											throw {
												errors: [
													{
														message: `File upload error: ${err.toString()}`,
													},
												],
												productData: { ...fields },
											};
										}
									);
								}
							}
							images.push(imageSrc + '/' + files.images.name);

							const productResult = await productService.addProductToDB(
								newProduct
							);

							const imageResults = await imageService.addImagesToDb(
								{
									sku: productResult.sku,
									images,
								}
							);

							res.json({
								product: { ...productResult },
								images: imageResults,
							});
						}
					} catch (e) {
						console.error(e.toString());
						res.json(e);
					}
				});
			} catch (err) {
				console.error(err.toString());
				res.json(err);
			}
		};
	}

	static getProductsAndImages(options) {
		const productService = options.productService;
		const imageService = options.imageService;

		return async (req, res) => {
			try {
				const productsData = await productService.getAllProducts();
				const imageData = await imageService.getAllImages();

				res.json({ productsData, imageData });
			} catch (err) {
				console.error(err.toString());
				res.json(err);
			}
		};
	}

	// static getProductBySKU(options) {
	// 	const productService = options.productService;

	// 	return async (req, res) => {
	// 		try {
	// 			const prodSku = req.params.sku;
	// 			const currentData = await productService.getProductBySku(
	// 				prodSku
	// 			);
	// 			res.json(currentData);
	// 		} catch (err) {
	// 			console.error(err.toString());
	// 			res.json(err);
	// 		}
	// 	};
	// }

	// static modifyProduct(options) {
	// 	const productService = options.productService;

	// 	return async (req, res) => {
	// 		try {
	// 			const result = await productService.modifyProductData(req.body);
	// 			res.json(result);
	// 		} catch (err) {
	// 			console.log(err.toString());
	// 			res.json(err);
	// 		}
	// 	};
	// }

	// static modifyPrimaryPicture(options) {
	// 	const productService = options.productService;

	// 	return async (req, res) => {
	// 		try {
	// 			const fileInfo = {};
	// 			fileInfo.fileId = Number(req.params.id);
	// 			fileInfo.sku = req.body.sku;
	// 			const result = await productService.modifyProductPrimaryPicture(
	// 				fileInfo
	// 			);
	// 			res.json(result);
	// 		} catch (err) {
	// 			console.error(err.toString());
	// 			res.json(err);
	// 		}
	// 	};
	// }

	// static uploadNewPictures(options) {
	// 	const productService = options.productService;

	// 	return async (req, res) => {
	// 		try {
	// 			const form = formidable({ multiples: true });

	// 			await form.parse(req, async (err, fields, files) => {
	// 				const images = [];
	// 				if (err) {
	// 					console.error(err);
	// 					throw new CustomError(
	// 						'file_upload_error',
	// 						err.toString()
	// 					);
	// 				}
	// 				const { sku } = fields;

	// 				try {
	// 					let imageSrc = `http://localhost:5000/img/${sku}`;

	// 					if (files.images instanceof Array) {
	// 						files.images.forEach((f) => {
	// 							images.push(imageSrc + '/' + f.name);
	// 							fs.copyFileSync(
	// 								f.path,
	// 								`./static/img/${sku}/${f.name}`,
	// 								(err) => {
	// 									throw new CustomError(
	// 										'file_upload_error',
	// 										err.toString()
	// 									);
	// 								}
	// 							);
	// 						});
	// 						const result = await productService.addImages({
	// 							sku,
	// 							images,
	// 						});
	// 						res.json(result);
	// 					} else {
	// 						fs.copyFileSync(
	// 							files.images.path,
	// 							`./static/img/${sku}/${files.images.name}`,
	// 							(err) => {
	// 								throw new CustomError(
	// 									'file_upload_error',
	// 									err.toString()
	// 								);
	// 							}
	// 						);

	// 						images.push(imageSrc + '/' + files.images.name);
	// 						const result = await productService.addImages({
	// 							sku,
	// 							images,
	// 						});
	// 						res.json(result);
	// 					}
	// 				} catch (e) {
	// 					console.error(e.message);
	// 					res.json(e);
	// 				}
	// 			});
	// 		} catch (err) {
	// 			console.error(err.toString());
	// 			res.json(err);
	// 		}
	// 	};
	// }

	// static deleteImageFromDB(options) {
	// 	const productService = options.productService;

	// 	return async (req, res) => {
	// 		try {
	// 			const { fileId } = req.body;
	// 			const fileInfo = await productService.deleteImage(
	// 				Number(fileId)
	// 			);
	// 			const fileName = await fileInfo.url.split('/');

	// 			fs.unlinkSync(
	// 				`${path.join(
	// 					__dirname,
	// 					'..',
	// 					'static',
	// 					'img',
	// 					fileInfo.product_sku,
	// 					fileName[fileName.length - 1]
	// 				)}`
	// 			);

	// 			res.json('ok');
	// 		} catch (err) {
	// 			console.error(err.toString());
	// 			res.json(err);
	// 		}
	// 	};
	// }

	// static getProductImages(options) {
	// 	const productService = options.productService;

	// 	return async (req, res) => {
	// 		try {
	// 			const sku = req.params.sku;
	// 			const images = await productService.getProductImages(sku);
	// 			res.json(images);
	// 		} catch (err) {
	// 			console.error(err.toString());
	// 			res.json(err);
	// 		}
	// 	};
	// }
}

module.exports = ProductController;