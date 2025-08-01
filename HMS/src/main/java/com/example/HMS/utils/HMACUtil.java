package com.example.HMS.utils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;
import java.nio.charset.Charset;
import java.util.Arrays;
import java.util.LinkedList;

public class HMACUtil {
    public final static String HMACMD5 = "HmacMD5";
    public final static String HMACSHA1 = "HmacSHA1";
    public final static String HMACSHA256 = "HmacSHA256";
    public final static String HMACSHA512 = "HmacSHA512";
    public final static Charset UTF8CHARSET = Charset.forName("UTF-8");

    public final static LinkedList<String> HMACS = new LinkedList<String>(Arrays.asList("UnSupport", "HmacSHA256", "HmacMD5", "HmacSHA384", "HMacSHA1", "HmacSHA512"));

    private static byte[] HMacEncode(final String algorithm, final String key, final String data) {
        Mac macGenerator = null;
        try {
            macGenerator = Mac.getInstance(algorithm);
            SecretKeySpec signingKey = new SecretKeySpec(key.getBytes("UTF-8"), algorithm);
            macGenerator.init(signingKey);
        } catch (Exception ex) {
        }

        if (macGenerator == null) {
            return null;
        }

        byte[] dataByte = null;
        try {
            dataByte = data.getBytes("UTF-8");
        } catch (UnsupportedEncodingException e) {
        }

        return macGenerator.doFinal(dataByte);
    }

    public static String HMacHexStringEncode(final String algorithm, final String key, final String data) {
        byte[] hmacEncodeBytes = HMacEncode(algorithm, key, data);
        if (hmacEncodeBytes == null) {
            return null;
        }
        return HexStringUtil.byteArrayToHexString(hmacEncodeBytes);
    }

    static class HexStringUtil {
        public static String byteArrayToHexString(byte[] bytes) {
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        }
    }
}
