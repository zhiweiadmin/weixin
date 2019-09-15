package com.redbudtek.weixin.util;

import org.apache.commons.io.FileUtils;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;

/**
 * SpringBoot上传文件工具类
 * @author LinkinStar
 */
public class FileHandleUtil {

    private static String filePath = "/file/";

    public static String upload(InputStream inputStream,String filename) {
        String fileLastPath = filePath + System.currentTimeMillis() + "_" +filename;
        //存文件
        File uploadFile = new File(fileLastPath);
        try {
            FileUtils.copyInputStreamToFile(inputStream, uploadFile);
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }

        return fileLastPath;
    }

    public static boolean delete(String filePath) {
        File file = new File(filePath);
        if (file.exists()) {
            return file.delete();
        }
        return false;
    }
}
