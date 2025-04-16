# TensorBoard Experiment Exporter

![TensorBoard Exporter Logo](icons/icon128.png)

A Chrome extension that extracts experiment names and maximum values from TensorBoard Time Series charts.

## Features

- Extract experiment names and their maximum values from visible series in TensorBoard
- Export data to CSV file
- Copy data to clipboard in a formatted text
- Works with TensorBoard running locally or remotely

## Installation

### From Source (Development)

1. Clone this repository:

    ```bash
    git clone https://github.com/Bacon9629/tensorboard-exporter.git
    ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" by toggling the switch in the top-right corner

4. Click "Load unpacked" and select the cloned repository folder

5. The extension should now appear in your Chrome toolbar

## Usage

1. Navigate to a TensorBoard page with Time Series charts

2. Filter experiments as needed in the TensorBoard UI

3. Pin the charts you want to extract data from using TensorBoard's pin feature to keep them at the top

4. Click on the TensorBoard Experiment Exporter icon in your Chrome toolbar

4. Choose one of the following options:
    - Export as CSV: Download a CSV file containing experiment names and maximum values
    - Copy to Clipboard: Copy the data in text format to your clipboard

5. If successful, you'll see a confirmation message

## How It Works

The extension works by:

1. Injecting a content script into TensorBoard pages
2. Analyzing the DOM structure to find visible experiment series
3. Extracting experiment names and calculating maximum values
4. Providing export options through a popup interface

## Troubleshooting

If the extension doesn't work correctly:

- Make sure you're on a TensorBoard page with Time Series charts visible
- Check if the experiments are properly loaded and displayed in TensorBoard
- **Try refreshing the page** and waiting for all data to load before using the extension
- **Pin the charts you want to extract data** from using TensorBoard's pin feature to keep them at the top
- Check the browser console for any error messages

## Advanced Configuration

The extension is configured to work with most TensorBoard setups, but you may need to adjust the selectors in `content.js` if you're using a different version of TensorBoard or if the DOM structure has changed.

## Development

### Project Structure

   ```text
   tensorboard-exporter/
   ├── manifest.json     # Extension configuration
   ├── popup.html        # Popup UI
   ├── popup.js          # Popup logic
   ├── content.js        # Content script for data extraction
   └── icons/            # Extension icons
   ├── icon16.png
   ├── icon48.png
   └── icon128.png
   ```


### Building and Testing

1. Make your changes to the source code
2. Test the extension by loading it as an unpacked extension in Chrome
3. Use the Chrome DevTools to debug any issues:
   - Right-click on the extension popup and select "Inspect" to debug the popup
   - Open the DevTools console on a TensorBoard page to debug the content script

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

