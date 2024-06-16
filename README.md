# Image Background Remover Web Application

This project is a web application that allows users to upload an image and remove its background in a fraction of a second using the RMBG-1.4 model from Hugging Face. The processed image is then displayed back to the user.

## Model

This application uses the **RMBG-1.4** model from Hugging Face for background removal. For more information about the model, visit the [Hugging Face model page](https://huggingface.co/briaai/RMBG-1.4).

## Installation

To run this project locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/AbolDev/image-background-remover-webapp.git
   cd image-background-remover-webapp
   ```

2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the web application:
   ```bash
   python app.py
   ```

4. Open your web browser and navigate to `http://127.0.0.1/`.

## Usage

1. On the main page, click the "Select File" button to upload an image.
2. Click the "Upload" button to process the image.
3. The image with the background removed will be displayed below.

## Example

Here is an example of an image before and after background removal:

### Before and After

![Before and After Image](t4.png)

### Processed Image

![Processed Image](processed_image.png)
