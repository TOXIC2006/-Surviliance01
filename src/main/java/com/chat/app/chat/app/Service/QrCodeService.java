package com.chat.app.chat.app.Service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
public class QrCodeService {

    @Value("${app.qr.width:300}")
    private int defaultWidth;

    @Value("${app.qr.height:300}")
    private int defaultHeight;

    @Value("${app.qr.base-url:surveil://device/}")
    private String baseUrl;

    /**
     * Generate a QR code PNG image as byte array.
     * The QR code encodes a deep-link URL: surveil://device/{qrCodeData}
     */
    public byte[] generateQrCode(String data) throws WriterException, IOException {
        return generateQrCode(data, defaultWidth, defaultHeight);
    }

    public byte[] generateQrCode(String data, int width, int height) throws WriterException, IOException {
        String qrContent = baseUrl + data;

        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(qrContent, BarcodeFormat.QR_CODE, width, height);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);

        return outputStream.toByteArray();
    }
}
