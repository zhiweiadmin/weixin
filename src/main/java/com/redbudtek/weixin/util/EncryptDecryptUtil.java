package com.redbudtek.weixin.util;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import org.apache.log4j.Logger;

/**
 * 加密解密工具类
 * @author jinxin.zhou
 */
public class EncryptDecryptUtil {
	
	private static Logger logger = Logger.getLogger(EncryptDecryptUtil.class);

	/**
	 * sha1(安全哈希算法)
	 * @author jinxin.zhou
	 */
	public static String sha1(String decrypt){		
		try {
			MessageDigest digest = MessageDigest.getInstance("SHA-1");
			digest.update(decrypt.getBytes());
			byte messageDigest[] = digest.digest();
			//create Hex String
			StringBuffer hexString = new StringBuffer();
			//字节数组转换为十六进制数
			for(int i = 0; i < messageDigest.length; i++){
				String shaHex = Integer.toHexString(messageDigest[i] & 0xFF);
				if(shaHex.length() < 2){
					hexString.append(0);
				}
				hexString.append(shaHex);
			}
			return hexString.toString();
		} catch (NoSuchAlgorithmException e) {
			logger.error(e.getMessage());
		}		
		return "";
	}
}
