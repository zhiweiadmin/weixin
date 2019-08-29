package com.redbudtek.weixin.util;

import sun.misc.BASE64Decoder;
import sun.misc.BASE64Encoder;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;

/**
 * 复制过来
 * 原文: http://blog.csdn.net/yyh352091626/article/details/49022315
 * 官方API: http://docs.oracle.com/javase/7/docs/api/javax/crypto/Cipher.html#getInstance(java.lang.String)
 * 参数说明: http://docs.oracle.com/javase/7/docs/technotes/guides/security/StandardNames.html#Cipher
 * @author jinxin.zhou
 * @date 2017/7/3
 */
public class AESUtils {

    /**
     * 密钥算法
     * @author jinxin.zhou
     * @date 2017/7/3
     */
    private static final String ALGORITHM = "AES";

    /**
     * 加解密算法/工作模式/填充方式
     * @author jinxin.zhou
     * @date 2017/7/3
     */
    private static final String ALGORITHM_STR = "AES/ECB/PKCS5Padding";

    /**
     * 16位密钥
     * @author jinxin.zhou
     * @date 2017/7/3
     */
    public static String HEX_KEY = "redbudtekanylink";

    /**
     * SecretKeySpec类是KeySpec接口的实现类,用于构建秘密密钥规范
     * @author jinxin.zhou
     * @date 2017/7/3
     */
    private static SecretKeySpec key = new SecretKeySpec(HEX_KEY.getBytes(), ALGORITHM);

    /**
     * AES加密
     * @author jinxin.zhou
     * @date 2017/7/3
     */
    public static String encryptData(String data) throws Exception {
        Cipher cipher = Cipher.getInstance(ALGORITHM_STR); // 创建密码器
        cipher.init(Cipher.ENCRYPT_MODE, key);// 初始化
        return new BASE64Encoder().encode(cipher.doFinal(data.getBytes()));
    }

    /**
     * AES解密
     * @author jinxin.zhou
     * @date 2017/7/3
     */
    public static String decryptData(String base64Data) throws Exception{
        Cipher cipher = Cipher.getInstance(ALGORITHM_STR);
        cipher.init(Cipher.DECRYPT_MODE, key);
        return new String(cipher.doFinal(new BASE64Decoder().decodeBuffer(base64Data)));
    }

    /**
     * hex字符串 转 byte数组
     * @param s
     * @return
     */
    private static byte[] hex2byte(String s) {
        if (s.length() % 2 == 0) {
            return hex2byte (s.getBytes(), 0, s.length() >> 1);
        } else {
            return hex2byte("0"+s);
        }
    }

    private static byte[] hex2byte (byte[] b, int offset, int len) {
        byte[] d = new byte[len];
        for (int i=0; i<len*2; i++) {
            int shift = i%2 == 1 ? 0 : 4;
            d[i>>1] |= Character.digit((char) b[offset+i], 16) << shift;
        }
        return d;
    }

}
